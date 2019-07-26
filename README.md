# junit-merge


[![CircleCI](https://circleci.com/gh/bitcoder/cucumber-json-merge.svg?style=shield)](https://circleci.com/gh/bitcoder/cucumber-json-merge) [![Coverage Status](https://coveralls.io/repos/github/bitcoder/cucumber-json-merge/badge.svg?branch=master)](https://coveralls.io/github/bitcoder/cucumber-json-merge?branch=master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/bitcoder/cucumber-json-merge.svg)](https://greenkeeper.io/)

## NodeJS CLI for merging Cucumber JSON test results


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

### Contributing

Feel free to submit issues and/or PRs!  In lieu of a formal style guide, 
please follow existing styles.
