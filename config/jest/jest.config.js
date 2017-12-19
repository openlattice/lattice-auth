const PACKAGE = require('../../package.json');

module.exports = {
  coveragePathIgnorePatterns: [
    '<rootDir>/src/utils/invalid.js'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: true,
  globals: {
    __VERSION__: PACKAGE.version
  },
  rootDir: '../..'
};
