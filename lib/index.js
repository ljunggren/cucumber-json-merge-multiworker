"use strict";

const fs = require("fs");
const fspath = require("path");
const read = require("fs-readdir-recursive");
const mkdirp = require("mkdirp");

/**
 * List all JSON files in directory
 * @param {*} path
 * @param {*} recursive
 */
function listJsonFiles(path, recursive) {
  try {
    var allFiles = recursive ? read(path) : fs.readdirSync(path);

    var jsonFiles = allFiles
      .map(function(file) {
        return fspath.join(path, file);
      })
      // Fiter out non-files
      .filter(function(file) {
        return fs.statSync(file).isFile();
      })
      // Only return files ending in '.json'
      .filter(function(file) {
        return file.slice(-5) === ".json";
      });
    // No files returned
    if (!jsonFiles.length > 0) {
      return new Error("No json files found");
    } else {
      // Return the array of files ending in '.json'
      return jsonFiles;
    }
  } catch (e) {
    throw e;
  }
}

function mergeFiles(files) {
  let mergedResults = [];
  files.forEach(function(file) {
    try {
      let rawdata = fs.readFileSync(file);
      let partialResults = JSON.parse(rawdata);
      mergedResults.push(partialResults);
    } catch (err) {
      if (err instanceof SyntaxError) {
        throw new Error("Invalid JSON content");
      } else {
        throw err;
      }
    }
  });
  return JSON.stringify(mergedResults.concat.apply([], mergedResults));
}

function writeMergedFile(file, data, createOutputDir) {
  try {
    fs.writeFileSync(file, data);
  } catch (error) {
    if (error.code == "ENOENT") {
      if (createOutputDir) {
        mkdirp.sync(file.substr(0, file.lastIndexOf("/")));
        fs.writeFileSync(file, data);
      } else {
        throw new Error("Missing output directory");
      }
    }
  }
}

module.exports = {
  listJsonFiles,
  mergeFiles,
  writeMergedFile,
};
