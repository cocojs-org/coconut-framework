const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxWorkers: 1,
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/packages/coco-mvc-rollup-plugin/**/*.test.js'],
    moduleFileExtensions: ['js', 'jsx'],
    moduleNameMapper: {
        '@cocojs/rollup-plugin-mvc': '<rootDir>/packages/coco-mvc-rollup-plugin/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};
