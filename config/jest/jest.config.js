const PACKAGE = require('../../package.json');

module.exports = {
  coveragePathIgnorePatterns: [
    '<rootDir>/src/utils/testing/Invalid.js',
    '<rootDir>/src/utils/testing/MockLocalStorage.js'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/auth/*.js',
    '**/src/config/*.js'
  ],
  globals: {
    __VERSION__: PACKAGE.version
  },
  rootDir: '../..',
  setupFiles: [
    '<rootDir>/src/utils/testing/MockLocalStorage.js'
  ]
};
