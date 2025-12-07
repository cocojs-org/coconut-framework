const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxConcurrency: 1,
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/packages/coco-webpack-loader-assign-class-ssid/**/*.test.js'],
    moduleNameMapper: {
        '@cocojs/webpack-loader-assign-class-ssid': '<rootDir>/packages/coco-webpack-loader-assign-class-ssid/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};