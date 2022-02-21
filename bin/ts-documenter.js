#!/usr/bin/env node
'use strict'
const fs = require("fs");
const { APIExtractor } = require("../dist/dist-cjs/APIExtractor");

let outputDir = "docs";
if (process.argv.length == 2) {
  usage();
  return;
}

let start = 2;
if (process.argv[2] == "--out") {
  if (process.argv.length == 3) {
    usage();
    return;
  }
  outputDir = process.argv[3];
  if (process.argv.length == 4) {
    usage();
    return;
  }
  start = 4;
}
let packages = [];
for (let i=start; i<process.argv.length; i++) packages.push(process.argv[i]);

APIExtractor.document(packages, outputDir);

function usage() {
  console.log("Usage: ts-documenter [--out <doc-dir-path>] <package-name> ...");
  process.exit(-1);
}