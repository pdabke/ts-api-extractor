"use strict"
const fs = require("fs");
const path = require("path");
const { execSync } = require('child_process')
const { APIExtractor } = require("../dist/dist-cjs/APIExtractor");
beforeAll(() => {
  execSync("tsc -p tsconfig.types.json", { cwd: path.resolve(__dirname, "test_package") })
});

afterAll(() => {
  fs.rmSync(path.resolve(__dirname, "test_package", "dist"), { recursive: true, force: true });
  fs.rmSync(path.resolve(__dirname, "testdocs"), { recursive: true, force: true });

});

test("Test API metadata extraction", () => {
  var api = APIExtractor.extract(path.resolve(__dirname, "test_package"));
  api = JSON.parse(JSON.stringify(api));
  api.package.path = undefined;
  const expectedOutput = JSON.parse(fs.readFileSync(path.resolve(__dirname, "test_output.json")));
  expectedOutput.package.path = undefined;
  expect(api).toEqual(expectedOutput);
});

test("Test API document generation", () => {
  let docDir = path.resolve(__dirname, "testdocs");
  APIExtractor.document([path.resolve(__dirname, "test_package")], docDir);
  expect(fs.existsSync(docDir)).toEqual(true);
  expect(fs.readdirSync(docDir).length).toEqual(61);
});

