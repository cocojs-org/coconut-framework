const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '../..'),
  cache: false,
  maxConcurrency: 1,
  testEnvironment: 'jsdom',
  testMatch: ['**/*.test.ts'],
  testPathIgnorePatterns: [
    '<rootDir>/packages/react-reconciler/',
    '<rootDir>/packages/react-dom/',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '\\.[jt]sx?$': '<rootDir>/scripts/jest/transformer.js',
  },
  moduleNameMapper: {
    'coco-mvc/jsx-runtime$': '<rootDir>/packages/coco-mvc/dist/coco-mvc.cjs.js',
    'coco-mvc$': '<rootDir>/packages/coco-mvc/dist/coco-mvc.cjs.js',
    '@cocojs/cli$': '<rootDir>/packages/coco-cli/dist/index.js',
    'react-shared$': '<rootDir>/packages/react-shared/src/index.js',
    shared$: '<rootDir>/packages/shared/src/index.ts',
  },
  globals: {
    __DEV__: false,
    __TEST__: true,
  },
};
