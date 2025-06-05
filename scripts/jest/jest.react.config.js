const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '../..'),
  cache: false,
  maxConcurrency: 1,
  testEnvironment: 'jsdom',
  testMatch: ['**/packages/coconut-web/**/*-test.jsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '\\.[jt]sx?$': [
      'babel-jest',
      {
        configFile: path.join(__dirname, './babel.config.js'),
      },
    ],
  },
  moduleNameMapper: {
    'coco-mvc/jsx-runtime$': '<rootDir>/packages/coco-mvc/dist/jsx.cjs.js',
    'coco-mvc$': '<rootDir>/packages/coco-mvc/dist/coco-mvc.cjs.js',
    'coconut-reconciler': '<rootDir>/packages/coconut-reconciler/src/index.js',
    shared$: '<rootDir>/packages/shared/src/index.ts',
    ReactFiberHostConfig$:
      '<rootDir>/packages/coconut-web/src/client/ReactDomHostConfig.js',
  },
  globals: {
    __DEV__: false,
    __TEST__: true,
  },
};
