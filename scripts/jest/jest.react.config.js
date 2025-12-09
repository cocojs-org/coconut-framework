const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxConcurrency: 1,
    testEnvironment: 'jsdom',
    testMatch: ['**/packages/react-dom/**/*-test.jsx'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '\\.[jt]sx?$': '<rootDir>/scripts/jest/react-transform.js',
    },
    moduleNameMapper: {
        '@cocojs/mvc': '<rootDir>/packages/coco-mvc/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};
