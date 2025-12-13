const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxConcurrency: 1,
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/packages/coco-mvc-webpack-loader/**/*.test.js'],
    moduleNameMapper: {
        '@cocojs/webpack-loader-mvc': '<rootDir>/packages/coco-mvc-webpack-loader/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};