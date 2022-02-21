import path from "path";
import { Program } from "typescript";
import { CompilerState } from "@microsoft/api-extractor/lib/api/CompilerState";
import { ExtractorConfig } from "@microsoft/api-extractor/lib/api/ExtractorConfig";
import { MessageRouter } from "@microsoft/api-extractor/lib/collector/MessageRouter";
import { Collector } from "@microsoft/api-extractor/lib/collector/Collector";
import { ApiModelGenerator } from "@microsoft/api-extractor/lib/generators/ApiModelGenerator";
import { APIMetadata } from "./APIMetaData";
import { APIClass, APIEntity, APIEnum, APIEnumMember, APIInterface, APIMethod, APIPackage, APIParam, APIProperty, APITypeAlias } from ".";
import { ApiConstructor, ApiItemKind, ApiMethod, ApiMethodSignature, ApiModel, ApiPackage, ApiProperty, ApiPropertySignature } from "@microsoft/api-extractor-model";
import { MarkdownDocumenter } from "@microsoft/api-documenter/lib/documenters/MarkdownDocumenter";

import fs from "fs";

/**
 * Main class that provides methods for extracting API metadata
 * @public
 */
export class APIExtractor {
  /**
   * 
   * @param pkg - Name or root directory of the target package
   * @param basePkg - Used to look up the target package if it is locally installed in the base package
   * @returns API metadata for the target package
   */
  static extract(pkg: string, basePkg?: APIPackage): APIMetadata {
    const pkgInstallDir = figureOutInstallDir(pkg, basePkg);
    const md: APIMetadata = new APIMetadata();
    const packageJson = getPackageJson(pkgInstallDir);
    md.package = { name: packageJson.name, version: packageJson.version, path: path.resolve(pkgInstallDir) };
    const apiPkg = createAPIPackage(pkgInstallDir, packageJson.name, packageJson.types);
    const entities: Map<string, APIEntity> = translateAPI(apiPkg);
    md.metadata = entities;
    return md;
  }

  static document(packages: string[], outputDir: string) {
    const model = new ApiModel();
    for (const p of packages) {
      const pkgInstallDir = figureOutInstallDir(p);
      const packageJson = getPackageJson(pkgInstallDir);
      const pkg : ApiPackage = createAPIPackage(pkgInstallDir, packageJson.name, packageJson.types);

      /*
      * This is a terrible hack but there was no other way of using the underlying 
      * @microsoft/api-extractor APIs without writing out a json file for each 
      * package, the very reason we had to build this layer on top.
      */
      const pkg2 = pkg as any;
      pkg2._parent = undefined;
      model.addMember(pkg2);
    }
    const markdownDocumenter: MarkdownDocumenter = new MarkdownDocumenter({
      apiModel: model,
      documenterConfig: undefined,
      outputFolder: outputDir
    });
    markdownDocumenter.generateFiles();

  }
}

function figureOutInstallDir(pkg: string, basePkg?: APIPackage): string {
  if (!pkg) return process.cwd();
  if (fs.existsSync(pkg)) {
    if (fs.statSync(pkg).isDirectory()) return pkg;
    else throw new Error("Expected package name or directory path. Found file path.");
  }
  let prev = null;
  let curr = basePkg ? basePkg.path : process.cwd();
  let installDir = undefined;
  while (prev != curr && curr) {
    if (fs.existsSync(path.join(curr, "node_modules", pkg))) {
      installDir = path.join(curr, "node_modules", pkg);
      break;
    }
    prev = curr;
    curr = path.dirname(curr);
  }
  if (!installDir && basePkg) {
    // Check if this is a local package
    const pkgJson = JSON.parse(fs.readFileSync(path.join(basePkg.path, "package.json"), { encoding: "utf-8" }));
    const pkgPath = pkgJson.dependencies[pkg];
    if (pkgPath && pkgPath.startsWith("file:")) {
      installDir = path.resolve(basePkg.path, pkgPath.substring(5));
    }

  }
  if (!installDir) throw new Error("Could not find install directory for package " + pkg);
  return installDir;
}

function getPackageJson(pkgInstallDir) {
  try {
    const p = require(path.resolve(pkgInstallDir, "package.json"));
    if (p) return p;
  } catch (e) {
    throw new Error("Package root directory does not contain package.json file.");
  }
  throw new Error("Package root directory does not contain package.json file.");

}

function createAPIPackage(projectFolder: string, pkgName: string, typeDefPath: string) {
  if (!pkgName) throw new Error("Package name must be defined.");
  const entryFilePath = path.resolve(projectFolder, typeDefPath);
  const tsConfigPath = path.resolve(projectFolder, "tsconfig.json");
  const apiJsonPath = path.resolve(projectFolder, "config", pkgName + ".json");
  const configFile = {
    mainEntryPointFilePath: entryFilePath, projectFolder: projectFolder,
    compiler: { tsconfigFilePath: tsConfigPath }, docModel: { enabled: true, apiJsonFilePath: apiJsonPath }
  };
  const configOptions = {
    configObject: configFile,
    packageJsonFullPath: path.resolve(projectFolder, "package.json"), configObjectFullPath: ""
  };
  // Load and parse the api-extractor.json file
  const extractorConfig: ExtractorConfig = ExtractorConfig.prepare(configOptions);

  const messageRouter = new MessageRouter({
    workingPackageFolder: extractorConfig.packageFolder,
    messageCallback: undefined,
    messagesConfig: {},
    showVerboseMessages: false,
    showDiagnostics: false,
    tsdocConfiguration: extractorConfig.tsdocConfiguration
  });

  const compilerState: CompilerState = CompilerState.create(extractorConfig);

  const program: Program = compilerState.program as Program;
  const collector = new Collector({
    program: program,
    messageRouter: messageRouter,
    extractorConfig: extractorConfig
  });

  collector.analyze();
  const modelGen = new ApiModelGenerator(collector);
  return modelGen.buildApiPackage();
}

function translateAPI(apiPackage: ApiPackage): Map<string, APIEntity> {
  const types: Map<string, APIEntity> = new Map<string, APIEntity>();
  const entryPoint = apiPackage.members[0];
  let obj = null;
  for (const apiItem of entryPoint.members) {
    switch (apiItem.kind) {
    case ApiItemKind.Class:
      obj = extractClass(apiItem);
      obj.kind = "class";
      types[obj.name] = obj;
      break;
    case ApiItemKind.Enum:
      obj = extractEnum(apiItem);
      obj.kind = "enum";
      types[obj.name] = obj;
      break;
    case ApiItemKind.Interface:
      obj = extractInterface(apiItem);
      obj.kind = "interface";
      types[obj.name] = obj;
      break;
    case ApiItemKind.TypeAlias:
      obj = extractTypeAlias(apiItem);
      obj.kind = "type-alias";
      types[obj.name] = obj;
      break;

    }
  }

  return types;
}

function extractInterface(item) {
  const info = new APIInterface(item.displayName);
  setDeprecated(info, item);
  const imps = [];
  for (const intf of item.extendsTypes) {
    imps.push(getTypeInfo(intf.excerpt.spannedTokens[0]));
  }
  if (imps.length > 0) info.extends = imps;

  setComment(info, item);
  info.methods = [];
  info.properties = [];
  for (const m of item.members) {
    if (m instanceof ApiMethodSignature) {
      info.methods.push(extractMethodSignatureInfo(m));
    } else if (m instanceof ApiPropertySignature) {
      info.properties.push(extractPropertySignatureInfo(m));
    }
  }
  return info;
  // console.log(JSON.stringify(info));
}

function extractTypeAlias(item) {
  const ta = new APITypeAlias(item.displayName);
  setComment(ta, item);
  const types = [];
  for (let index = item.typeExcerpt.tokenRange.startIndex; index < item.typeExcerpt.tokenRange.endIndex + 1; index++) {
    const typeInfo = getTypeInfo(item.typeExcerpt.tokens[index]);
    if (typeInfo) {
      if (Array.isArray(typeInfo)) {
        for (const ty of typeInfo) types.push(ty);
      } else types.push(typeInfo);
    }
  }
  ta.types = types;
  let allLiterals = true;
  for (const ty of ta.types) if ((typeof ty) != "string") allLiterals = false;
  if (allLiterals) ta.isAllLiterals = true;
  return ta;
}

function getTypeInfo(excerptToken) {
  const txt = excerptToken.text.trim();
  if (txt == ";") return undefined;
  if (excerptToken.kind == "Content") {
    const tArray = txt.split("|");
    const retArray = [];
    for (const ta of tArray) {
      const ta2 = ta.trim();
      if (!ta2) continue;
      if (ta2 == "true" || ta2 == "false" || ta2.startsWith("'") || ta2.startsWith("\"") ||
        /^\d+$/.test(ta2)) retArray.push(ta2);
      else retArray.push({ type: ta2 });
    }
    return retArray;
  } else {
    return {
      type: txt.replace("|", "").trim(),
      package: excerptToken.canonicalReference.source.escapedPath
    };
  }
}
function extractClass(item) {
  const info = new APIClass(item.displayName);
  setDeprecated(info, item);
  setComment(info, item);
  info.constructors = [];
  info.methods = [];
  info.properties = [];
  const ex = getFullyQualifiedReference(item.extendsType);
  if (ex) info.extends = ex;
  if (item.implementsTypes) {
    const imps = [];
    for (const intf of item.implementsTypes) {
      imps.push(getTypeInfo(intf.excerpt.spannedTokens[0]));
    }
    info.implements = imps;
  }

  for (const m of item.members) {
    if (m instanceof ApiMethod) {
      info.methods.push(extractMethodInfo(m));
    } else if (m instanceof ApiProperty) {
      info.properties.push(extractPropertyInfo(m));
    } else if (m instanceof ApiConstructor) {
      info.constructors.push(extractConstructorInfo(m));
    }
  }
  return info;
}

function extractEnum(item) {
  const einfo = new APIEnum(item.displayName);
  setComment(einfo, item);
  const members = [];
  einfo.members = members;
  for (const em of item.members) {
    const emInfo = new APIEnumMember();
    emInfo.key = em.name;
    setComment(emInfo, em);
    const oval = em.excerpt.tokens.length == 2 ? em.excerpt.tokens[1].text : undefined;
    if (oval) emInfo.value = oval;
    members.push(emInfo);
  }
  return einfo;
}

function getText(node, txt?: string): string {
  if (!txt) txt = "";
  if (Array.isArray(node)) {
    for (const n of node) {
      txt = txt + getText(n);
    }
    return txt;
  }
  if (node.nodes) {
    for (const n of node.nodes) {
      txt = txt + getText(n);
    }
  } else if (node.text) {
    return txt + node.text;
  } else if (node.code) {
    return txt + "<code>" + node.code + "</code>";
  }
  return txt;
}

function setComment(output, item) {
  if (item.tsdocComment?.summarySection?.nodes) {
    const summary = getText(item.tsdocComment.summarySection);
    output.comment = summary;
  }

}

function setDeprecated(output, input) {
  if (input.tsdocComment?.deprecatedBlock) {
    const comment: string = getText(input.tsdocComment.deprecatedBlock.content);
    if (comment) output.isDeprecated = comment;
    else output.isDeprecated = true;
  }
}

function extractPropertySignatureInfo(prop) {
  const p = new APIProperty();
  p.name = prop.displayName;
  if (prop.isOptional) p.isOptional = true;
  p.type = prop.propertyTypeExcerpt.text;
  if (prop.propertyTypeExcerpt.tokens[0].text?.includes("readonly")) p.isReadOnly = true;
  const cr = prop.propertyTypeExcerpt.tokens[prop.propertyTypeExcerpt.tokenRange.startIndex].canonicalReference;
  if (cr?.source?.escapedPath) p.package = cr.source.escapedPath;
  setComment(p, prop);
  return p;
}

function extractMethodSignatureInfo(m) {
  const method = new APIMethod();
  method.name = m.displayName;
  setDeprecated(method, m);
  method.returns = { type: m.returnTypeExcerpt.text };
  for (let i = m.returnTypeExcerpt.tokenRange.startIndex; i < m.returnTypeExcerpt.tokenRange.endIndex; i++) {
    if (m.returnTypeExcerpt.tokens[i].kind == "Reference" && m.returnTypeExcerpt.tokens[i].text != "Promise") {
      method.returns.package = m.returnTypeExcerpt.tokens[i].canonicalReference?.source?.escapedPath;
      break;
    }
  }
  setComment(method, m);
  const params = [];
  for (const p of m.parameters) {
    const isOptional = p.parameterTypeExcerpt.tokens[p.parameterTypeExcerpt.tokenRange.startIndex - 1].text.includes("?");
    const cr = p.parameterTypeExcerpt.tokens[p.parameterTypeExcerpt.tokenRange.startIndex].canonicalReference;
    const pp: APIParam = { name: p.name, type: p.parameterTypeExcerpt.text, package: cr?.source.escapedPath };
    if (isOptional) pp.isOptional = true;
    if (p.tsdocParamBlock?.content?.nodes)
      pp.comment = getText(p.tsdocParamBlock?.content?.nodes);
    params.push(pp);
  }
  method.params = params;
  return method;
}

function extractPropertyInfo(prop) {
  const p = new APIProperty();
  p.name = prop.displayName;
  if (prop.isStatic) {
    p.isStatic = true;
  }
  if (prop.isOptional) p.isOptional = true;
  p.type = prop.propertyTypeExcerpt.text;
  if (prop.propertyTypeExcerpt.tokens[0].text?.includes("readonly")) p.isReadOnly = true;
  // Private properties never make it to this stage so just check for protected
  if (prop.propertyTypeExcerpt.tokens[0].text?.includes("protected")) p.isProtected = true;
  const cr = prop.propertyTypeExcerpt.tokens[prop.propertyTypeExcerpt.tokenRange.startIndex].canonicalReference;
  if (cr?.source?.escapedPath) p.package = cr.source.escapedPath;
  setComment(p, prop);
  return p;
}

function extractMethodInfo(m) {
  const method = new APIMethod();
  method.name = m.displayName;
  setDeprecated(method, m);
  if (m.isStatic) method.isStatic = true;
  if (m.isOptional) method.isOptional = true;
  if (m.excerptTokens[0].text.includes("protected")) method.isProtected = true;
  method.returns = { type: m.returnTypeExcerpt.text };

  if (m.tsdocComment?.returnsBlock?.content?.nodes)
    method.returns.comment = getText(m.tsdocComment?.returnsBlock?.content?.nodes);

  for (let i = m.returnTypeExcerpt.tokenRange.startIndex; i < m.returnTypeExcerpt.tokenRange.endIndex; i++) {
    if (m.returnTypeExcerpt.tokens[i].kind == "Reference" && m.returnTypeExcerpt.tokens[i].text != "Promise") {
      method.returns.package = m.returnTypeExcerpt.tokens[i].canonicalReference?.source?.escapedPath;
      break;
    }
  }
  setComment(method, m);
  const params = [];
  for (const p of m.parameters) {
    const isOptional = p.parameterTypeExcerpt.tokens[p.parameterTypeExcerpt.tokenRange.startIndex - 1].text.includes("?");
    const cr = p.parameterTypeExcerpt.tokens[p.parameterTypeExcerpt.tokenRange.startIndex].canonicalReference;
    const pp: APIParam = { name: p.name, type: p.parameterTypeExcerpt.text, package: cr?.source.escapedPath };
    if (isOptional) pp.isOptional = true;
    if (p.tsdocParamBlock?.content?.nodes)
      pp.comment = getText(p.tsdocParamBlock?.content?.nodes);
    params.push(pp);
  }
  method.params = params;
  return method;
}

function extractConstructorInfo(m) {
  const method = new APIMethod();
  method.name = "constructor";
  setComment(method, m);
  const params = [];
  for (const p of m.parameters) {
    const isOptional = p.parameterTypeExcerpt.tokens[p.parameterTypeExcerpt.tokenRange.startIndex - 1].text.includes("?");
    const cr = p.parameterTypeExcerpt.tokens[p.parameterTypeExcerpt.tokenRange.startIndex].canonicalReference;
    const pp: APIParam = { name: p.name, type: p.parameterTypeExcerpt.text, package: cr?.source.escapedPath };
    if (isOptional) pp.isOptional = true;
    if (p.tsdocParamBlock?.content?.nodes)
      pp.comment = getText(p.tsdocParamBlock?.content?.nodes);
    params.push(pp);
  }
  method.params = params;
  return method;
}


function getFullyQualifiedReference(item) {
  if (!item || !(item.excerpt)) return;
  let cr = null;
  for (const token of item.excerpt.tokens) {
    if (token.canonicalReference) {
      cr = token.canonicalReference;
      break;
    }
  }

  if (cr) return { package: cr.source.escapedPath, type: cr.symbol.componentPath.component.text };
}