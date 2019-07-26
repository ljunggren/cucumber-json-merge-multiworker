"use strict";

var cucumberMerge = require("../lib/index.js");
var should = require("chai").should(); // eslint-disable-line no-unused-vars
var expect = require("chai").expect; // eslint-disable-line no-unused-vars

describe("File Handling", function() {
  describe("listJsonFiles()", function() {
    it("should return 3 files", function() {
      cucumberMerge.listJsonFiles("test/fixtures").length.should.equal(3);
    });

    it("should return 4 files", function() {
      cucumberMerge.listJsonFiles("test/fixtures", true).length.should.equal(4);
    });

    it("should report not a valid directory", function() {
      try {
        cucumberMerge.listJsonFiles("bad_dir", false);
      } catch (e) {
        e.code.should.equal("ENOENT");
      }
    });

    it("should report not json files found", function() {
      cucumberMerge
        .listJsonFiles("lib", false)
        .message.should.equal("No json files found");
    });
  });

  it("should be able to write a file", function() {
    try {
      cucumberMerge.writeMergedFile("test/moo.txt", "moo");
      expect("everything").to.be.ok;
    } catch (err) {
      err.should.equal("This should not error");
    }
  });

  it("should not be able to write a file if the output dir does not exist", function() {
    try {
      cucumberMerge.writeMergedFile("spacegoats/moo.txt", "moo");
    } catch (err) {
      err.message.should.equal("Missing output directory");
    }
  });

  it("should be able to write a file if the output dir does not exist and createDir is true", function() {
    try {
      cucumberMerge.writeMergedFile("goats/moo.txt", "moo", true);
      expect("everything").to.be.ok;
    } catch (err) {
      err.should.equal("This should not error");
    }
  });
});
