# @nabh/ts-api-extractor
`ts-api-extractor` is a utility for extracting metadata about the types exported by a Typescript library and creating API documentation. The extracted metadata can be used for a variety of use cases such as automated CLI creation and aspect oriented programming.

## Alternatives
`ts-api-extractor` relies on @microsoft/api-documenter, @microsoft/api-extractor, and @microsoft/api-extractor-model for implementing most of its functionality. Two key reasons for implementing `ts-api-extractor` package are:

* Metadata objects created by @microsoft/api-extractor package leave some of the properties as "excerptTokens". Details such as parameter types, qualifiers have to be further parsed from these "excerptTokens". `ts-api-extractor` does the parsing for you to create a more fine-grained specification of the API.
* @microsoft packages are designed around \<your-package\>.api.json files and are not easy to use programmatically. For example, creating documentation via @microsoft/api-documenter requires you to first create the .api.json files for all your packages and then invoking the api-documenter tool on the generated files. `ts-api-extractor` combines the two steps in one file-less operation. 

You can consider using @microsoft/* packages directly if your use case does not require the additional benefits provided by `ts-api-extractor`.
## Usage
Install globally or locally
```
npm i [-g] @nabh/ts-api-extractor
```
### Command Line Usage
#### Generating Metadata
`ts-api-extractor` provides the command `ts-api-extractor` to extract API metadata. If you install it globally, you can invoke the command as shown below.
```
> ts-api-extractor [--out <output-file-path>] [<pkg-name-or-dir]
```
Invoking the command without any arguments takes the current directory as the package root directory and prints the type information on the console. You can optionally provide the output file path and/or the package name/root directory.
#### Generating Documentation
`ts-api-extractor` provides the command `ts-documenter` that can generate Markdown documentation for a list of packages. You can use the command as shown below.
```shell
> ts-documenter [--out <output-dir>] <pkg-name-or-dir1> <pkg-name-or-dir2> ...
```
### Programmatic Usage
You can also install `ts-api-extractor` locally and use it in your Javascript code.
```javascript
const { APIExtractor } = require("@nabh/ts-api-extractor");
const apiDefs = APIExtractor.extract("test_package");

// Print API metadata object
console.log(JSON.stringify(apiDefs, null, 2));

// Generate Markdown documentation in apidocs directory
APIExtractor.document(["test_package"], "apidocs")
```
## How Does It Work?
`ts-api-extractor` reads the `package.json` file for the input Typescript package as a starting point. You can either directly specify the package root folder or specify the package name. If you provide the package name, `ts-api-extractor` attempts to find the package installation directory by recursively searching current and parent directories for `node_modules/\<package\>` folder. Once it is able to locate the `package.json` file, it uses the `types` field as the source of Typescript type definitions. 

The exported types are transformed into an hierarchy of metadata objects starting from an instance of class `APIMetadata`. Please see https://pdabke.github.io/ts-api-extractor/ts-api-extractor.html for full specification of the metadata schema. As an example, see the serialized JSON object that represents types exported by a test package.

```json
// JSON produced by serializing instance of APIMetadata object
{
  "package": {
    "name": "test_package",
    "version": "1.0.0",
    "path": "/user/test/test_package"
  },
  "metadata": {
    "alphanumeric": {
      "name": "alphanumeric",
      "kind": "type-alias",
      "comment": "A type that can be either a string or a number",
      "types": [
        {
          "type": "string"
        },
        {
          "type": "number"
        }
      ]
    },
    "DocBaseClass": {
      "name": "DocBaseClass",
      "kind": "class",
      "comment": "Example base class",
      "constructors": [
        {
          "name": "constructor",
          "comment": "The simple constructor for <code>DocBaseClass</code>",
          "params": []
        },
        {
          "name": "constructor",
          "comment": "The overloaded constructor for <code>DocBaseClass</code>",
          "params": [
            {
              "name": "x",
              "type": "number"
            }
          ]
        }
      ],
      "methods": [],
      "properties": [],
      "implements": []
    },
    "Fruits": {
      "name": "Fruits",
      "kind": "enum",
      "members": [
        {
          "key": "BANANA",
          "comment": "Subject",
          "value": "\"Banana\""
        },
        {
          "key": "MANGO",
          "comment": "King of fruits",
          "value": "\"Mango\""
        }
      ]
    },
    "IDocInterface1": {
      "name": "IDocInterface1",
      "kind": "interface",
      "comment": "",
      "methods": [],
      "properties": [
        {
          "name": "regularProperty",
          "type": "SystemEvent",
          "package": "test_package",
          "comment": "Does something"
        }
      ]
    }
 }
```
## Metadata Generation Examples
`ts-api-extractor` recognizes four types available in Typescript: 
enum, type (type alias), class, and interface. The following sections 
provide examples of source/generated metadata for each of these types.
### Enumeration
#### Source
```typescript
export enum Fruits {
  /**
   * King of fruits
   */
  MANGO = "Mango",

  /**
   * Subject
   */
  BANANA = "Banana"
}
```
#### Generated Metadata 
```json
{
  "Fruits": {
    "name": "Fruits",
    "members": [
      {
        "key": "BANANA",
        "comment": "Subject",
        "value": "\"Banana\""
      },
      {
        "key": "MANGO",
        "comment": "King of fruits",
        "value": "\"Mango\""
      }
    ],
    "kind": "enum"
  }
}
```
### Type Alias
#### Source
```typescript
/**
 * Type that maps to another type
 */
export type targetType = TypeAliasSource

/**
 * Type alias with string literals
 */
export type threeNumberStrings = "one" | "two" | "three";

```
#### Generated Metata
```json
{
    "targetType": {
      "name": "targetType",
      "kind": "type-alias",
      "comment": "Type that maps to another type",
      "types": [
        {
          "type": "TypeAliasSource",
          "package": "test_package"
        }
      ]
    },
    "threeNumberStrings": {
      "name": "threeNumberStrings",
      "kind": "type-alias",
      "comment": "Type alias with string literals",
      "types": [
        "\"one\"",
        "\"two\"",
        "\"three\""
      ],
      "isAllLiterals": true
    }
}
```
### Class
#### Source
```typescript
export class DocClass1 extends DocBaseClass implements IDocInterface1, IDocInterface2 {
  /**
   * An internal class constructor.
   * @internal
   */
  public constructor(name: string) {
    super();
  }

  public get readonlyProperty(): string {
    return 'hello';
  }

  public get writeableProperty(): string {
    return 'hello';
  }
  public set writeableProperty(value: string) {}

  /**
   * This is a regular property that happens to use the SystemEvent type.
   */
  public regularProperty: SystemEvent;

  /**
   * Returns the sum of two numbers.
   *
   * @remarks
   * This illustrates usage of the `@example` block tag.
   *
   * @param x - the first number to add
   * @param y - the second number to add
   * @returns the sum of the two numbers
   *
   * @example
   * Here's a simple example:
   * ```
   * // Prints "2":
   * console.log(DocClass1.sumWithExample(1,1));
   * ```
   * @example
   * Here's an example with negative numbers:
   * ```
   * // Prints "0":
   * console.log(DocClass1.sumWithExample(1,-1));
   * ```
   */
  public static sumWithExample(x: number, y: number): number {
    return x + y;
  }
}
```
#### Generated Metadata
```json
{
  "DocClass1": {
    "name": "DocClass1",
    "kind": "class",
    "comment": "This is an example class.",
    "constructors": [],
    "methods": [
      {
        "name": "sumWithExample",
        "isStatic": true,
        "returns": {
          "type": "number",
          "comment": " the sum of the two numbers"
        },
        "comment": "Returns the sum of two numbers.",
        "params": [
          {
            "name": "x",
            "type": "number",
            "comment": "the first number to add"
          },
          {
            "name": "y",
            "type": "number",
            "comment": "the second number to add"
          }
        ]
      }
    ],
    "properties": [
      {
        "name": "readonlyProperty",
        "type": "string",
        "isReadOnly": true
      },
      {
        "name": "regularProperty",
        "type": "SystemEvent",
        "package": "test_package",
        "comment": "This is a regular property that happens to use the SystemEvent type."
      },
      {
        "name": "writeableProperty",
        "type": "string"
      }
    ],
    "extends": {
      "package": "test_package",
      "type": "DocBaseClass"
    },
    "implements": [
      {
        "type": "IDocInterface1",
        "package": "test_package"
      },
      {
        "type": "IDocInterface2",
        "package": "test_package"
      }
    ]
  }
}

```
### Interface
#### Source
```typescript
/**
 * @public
 * {@docCategory DocBaseClass}
 */
export interface IDocInterface1 {
  /**
   * Does something
   */
  regularProperty: SystemEvent;
}

/**
 * @public
 * {@docCategory DocBaseClass}
 * @deprecated
 */
export interface IDocInterface2 extends IDocInterface1 {
  /**
   * @deprecated Use `otherThing()` instead.
   */
  deprecatedExample(): void;
}

```
#### Generated Metadata
```json
{
    "IDocInterface1": {
      "name": "IDocInterface1",
      "kind": "interface",
      "comment": "",
      "methods": [],
      "properties": [
        {
          "name": "regularProperty",
          "type": "SystemEvent",
          "package": "test_package",
          "comment": "Does something"
        }
      ]
    },
    "IDocInterface2": {
      "name": "IDocInterface2",
      "kind": "interface",
      "isDeprecated": true,
      "extends": [
        {
          "type": "IDocInterface1",
          "package": "test_package"
        }
      ],
      "comment": "",
      "methods": [
        {
          "name": "deprecatedExample",
          "isDeprecated": " Use <code>otherThing()</code> instead.",
          "returns": {
            "type": "void"
          },
          "comment": "",
          "params": []
        }
      ],
      "properties": []
    }
}
```