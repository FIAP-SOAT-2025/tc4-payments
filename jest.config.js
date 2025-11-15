module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary'],

  testMatch: ['**/src/**/test/**/*.spec.ts'],

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
  ],
};
