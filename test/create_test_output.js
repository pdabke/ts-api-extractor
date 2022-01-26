const fs = require("fs");
const path = require("path");
const { APIExtractor } = require("../dist/dist-cjs/APIExtractor");
const api = APIExtractor.extract("../../test/test_package");
fs.writeFileSync("test_output.json", JSON.stringify(api, null, 2));