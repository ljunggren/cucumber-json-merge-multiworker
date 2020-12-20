# cucumber-json-merge

[![NPM version](https://img.shields.io/npm/v/cucumber-json-merge.svg)](https://www.npmjs.com/package/cucumber-json-merge) [![License](https://img.shields.io/github/license/bitcoder/cucumber-json-merge.svg)](https://github.com/bitcoder/cucumber-json-merge/blob/master/LICENSE)
[![Coverage Status](https://coveralls.io/repos/github/bitcoder/cucumber-json-merge/badge.svg?branch=master)](https://coveralls.io/github/bitcoder/cucumber-json-merge?branch=master)
[![CI status](https://img.shields.io/github/workflow/status/bitcoder/cucumber-json-merge/CI-CD?label=CI&style=flat-square)](https://github.com/bitcoder/cucumber-json-merge/actions?query=workflow%3ACI-CD)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Known Vulnerabilities](https://snyk.io/test/github/bitcoder/cucumber-json-merge/badge.svg)](https://snyk.io/test/github/bitcoder/cucumber-json-merge)

## NodeJS CLI for merging Cucumber JSON test results

This work was highly based on previous work from [junit-merge](https://github.com/drazisil/junit-merge)

### Installation

    npm install -g cucumber-json-merge

Or just download the repository and include it in your `node_modules` directly.

### Usage

 ```
 Usage: cucumber-json-merge [options] <report1.json> [report2.json...]


  Options:

    -V, --version           output the version number
    -d, --dir <path>        merge all results in directory
    -C, --createDir         create the output directory if missing
    -r, --recursive         pass to recursively merge all results in directory
    -o, --out <mergedfile>  file to output to (default: ./merged-test-results.xml)
    -h, --help              output usage information
```

## Contributing

Feel free to submit issues and/or PRs!  In lieu of a formal style guide, 
please follow existing styles.

## Contact

You can find me on [Twitter](https://twitter.com/darktelecom).

## LICENSE

[Apache 2.0](LICENSE).
