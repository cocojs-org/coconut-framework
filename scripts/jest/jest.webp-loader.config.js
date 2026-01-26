const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxWorkers: 1,
    testEnvironment: 'jsdom',
    testMatch: ['<rootDir>/packages/coco-bundle-webpack/**/*.test.js'],
    moduleNameMapper: {
        '@cocojs/bundle-webpack': '<rootDir>/packages/coco-bundle-webpack/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};
