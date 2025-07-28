const path = require('path');

module.exports = {
  rootDir: path.join(__dirname, '../..'),
  cache: false,
  maxConcurrency: 1,
  testEnvironment: 'jsdom',
  testMatch: ['**/packages/react-dom/**/*-test.jsx'],
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
    'coco-mvc': '<rootDir>/packages/coco-mvc/dist/coco-mvc.cjs.js',
  },
  globals: {
    __DEV__: true,
    __TEST__: true,
  },
};
