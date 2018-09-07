const PACKAGE = require('../../package.json');

module.exports = {
  collectCoverage: true,
  collectCoverageFrom: [
    '**/src/index.js',
    '**/src/auth/*.js',
    '**/src/config/*.js',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coveragePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/config/',
    '<rootDir>/flow-typed/',
    '<rootDir>/src/utils/testing/Invalid.js',
    '<rootDir>/src/utils/testing/MockLocalStorage.js',
  ],
  globals: {
    __AUTH0_CLIENT_ID__: '__MISSING__',
    __AUTH0_DOMAIN__: '__MISSING__',
    __ENV_DEV__: false,
    __ENV_PROD__: false,
    __PACKAGE__: PACKAGE.name,
    __VERSION__: PACKAGE.version,
  },
  moduleNameMapper: {
    '\\.(png)$': '<rootDir>/__mocks__/assetMocks.js',
  },
  modulePathIgnorePatterns: [
    '<rootDir>/build/',
    '<rootDir>/flow-typed/',
  ],
  rootDir: '../..',
  setupFiles: [
    '<rootDir>/config/jest/enzyme.config.js',
  ],
  setupTestFrameworkScriptFile: '<rootDir>/config/jest/test.config.js',
  testEnvironment: '<rootDir>/config/jest/jsdom.config.js',
  testURL: 'http://localhost',
  transform: {
    '^.+\\.jsx?$': '<rootDir>/config/jest/babelJestTransformer.js',
  },
};
