const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '../..'),
  cache: false,
  maxConcurrency: 1,
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
  testPathIgnorePatterns: ['<rootDir>/packages/react-dom/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '\\.[jt]sx?$': '<rootDir>/scripts/jest/transformer.js',
  },
  // todo掉得coco-mvc之外的，也就是说只测试打包后的包吧，简单一些
  moduleNameMapper: {
    'coco-mvc': '<rootDir>/packages/coco-mvc/dist/coco-mvc.cjs.js',
    shared$: '<rootDir>/packages/shared/src/index.ts',
  },
  globals: {
    __DEV__: false,
    __TEST__: true,
  },
};
