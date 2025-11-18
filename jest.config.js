module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Permite Jest resolver arquivos .ts, .js, .json
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Se você usa imports como src/foo/bar
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
  },

  // Garante geração da cobertura exatamente como o SonarCloud exige
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text-summary', 'json-summary'],

  // Encontra seus testes em src/**/test/**/*.spec.ts
  testMatch: ['**/src/**/test/**/*.spec.ts'],

  // Mede cobertura só da aplicação, não dos testes
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.spec.ts',
  ],
};
