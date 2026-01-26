const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxWorkers: 1,
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/packages/coco-bundle-rollup/**/*.test.js'],
    moduleFileExtensions: ['js', 'jsx'],
    moduleNameMapper: {
        '@cocojs/bundle-rollup': '<rootDir>/packages/coco-bundle-rollup/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};
