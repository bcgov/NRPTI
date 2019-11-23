const { defaults } = require('jest-config'); // https://jestjs.io/docs/en/configuration

module.exports = {
  ...defaults,
  collectCoverage: true,
  collectCoverageFrom: ['./api/**/*.js', '!./api/**/*.test.js', '!./api/test/**'],
  coverageDirectory: './coverage',
  testEnvironment: 'node'
};
