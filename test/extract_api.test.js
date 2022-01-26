"use strict"
const fs = require("fs");
const path = require("path");
const {execSync} = require('child_process')
const { APIExtractor } = require("../dist/dist-cjs/APIExtractor");
beforeAll( () => {
  execSync("tsc -p tsconfig.types.json", {cwd: path.resolve(__dirname, "test_package")})
});

afterAll( () => {
  fs.rmSync(path.resolve(__dirname, "test_package", "dist"), { recursive: true, force: true});  
});

test("Test all classes, interfaces, type aliases, and enumeration in test package", () => {
  var api = APIExtractor.extract(path.resolve(__dirname, "test_package"));
  api = JSON.parse(JSON.stringify(api));
  const expectedOutput = JSON.parse(fs.readFileSync(path.resolve(__dirname, "test_output.json")));
    expect(api).toEqual(expectedOutput);
});
