import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  setupFiles: ['dotenv/config'],
  verbose: true,
  clearMocks: true,
  restoreMocks: true,
  testTimeout: 30000,

  // 👇 Mapeia "@/x" -> "<rootDir>/src/x"
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // se estiver usando tsconfig.test.json, mantenha isso:
  // globals: { 'ts-jest': { tsconfig: 'tsconfig.test.json' } },

  // Se mantiver os hooks globais:
  // globalSetup: '<rootDir>/tests/globalSetup.ts',
  // globalTeardown: '<rootDir>/tests/globalTeardown.ts',
};

export default config;
