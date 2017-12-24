const PACKAGE = require('../../package.json');

module.exports = {
  coveragePathIgnorePatterns: [
    '<rootDir>/src/utils/testing/Invalid.js',
    '<rootDir>/src/utils/testing/MockLocalStorage.js'
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/index.js',
    '**/src/auth/*.js',
    '**/src/config/*.js'
  ],
  globals: {
    __AUTH0_CLIENT_ID__: '__MISSING__',
    __AUTH0_DOMAIN__: '__MISSING__',
    __ENV_DEV__: false,
    __ENV_PROD__: false,
    __ENV_TEST__: true,
    __PACKAGE__: PACKAGE.name,
    __VERSION__: PACKAGE.version
  },
  moduleNameMapper: {
    '\\.(png)$': '<rootDir>/__mocks__/assetMocks.js'
  },
  rootDir: '../..',
  setupFiles: [
    '<rootDir>/config/jest/enzyme.config.js',
    '<rootDir>/src/utils/testing/MockLocalStorage.js'
  ]
};
