const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxConcurrency: 1,
    testEnvironment: 'jsdom',
    testMatch: ['**/packages/coco-rollup-plugin-assign-class-ssid/**/*.test.js'],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    moduleNameMapper: {
        '@cocojs/rollup-plugin-assign-class-ssid': '<rootDir>/packages/coco-rollup-plugin-assign-class-ssid/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};
