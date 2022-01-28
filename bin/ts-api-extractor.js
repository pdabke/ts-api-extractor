#!/usr/bin/env node
'use strict'
const fs = require("fs");
const { APIExtractor } = require("../dist/dist-cjs/APIExtractor");

let pkg = undefined;
let outputFile = undefined;
if (process.argv.length > 2) {
  if (process.argv[2] == "--out") {
    if (process.argv.length == 3) {
      usage();
    }
    outputFile = process.argv[3];
    if (process.argv.length == 5) pkg = process.argv[4];
  } else {
    if (process.argv.length != 3) {
      usage();
    }
    pkg = process.argv[2];
  }
}

var output = APIExtractor.extract(pkg);
if (outputFile) {
  fs.writeFileSync(outputFile, JSON.stringify(output, null, 2));
} else {
  console.log(JSON.stringify(output, null, 2))
}

function usage() {
  console.log("Usage: ts-api-extractor [--out <output-file-path>] [package-name]");
  process.exit(-1);
}