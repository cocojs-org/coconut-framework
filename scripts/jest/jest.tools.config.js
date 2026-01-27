/**
 * coco工具链测试配置文件
 */
const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxWorkers: 1,
    testEnvironment: 'jsdom',
    testMatch: [
        '<rootDir>/packages/coco-compiler/test/**/*.test.js',
        '<rootDir>/packages/coco-bundle-rollup/test/**/*.test.js',
        '<rootDir>/packages/coco-bundle-webpack/test/**/*.test.js',
    ],
    moduleNameMapper: {
        '@cocojs/compiler': '<rootDir>/packages/coco-compiler/dist/index.cjs.js',
        '@cocojs/bundle-rollup': '<rootDir>/packages/coco-bundle-rollup/dist/index.cjs.js',
        '@cocojs/bundle-webpack': '<rootDir>/packages/coco-bundle-webpack/dist/index.cjs.js',
    },
    globals: {
        __DEV__: true,
        __TEST__: true,
    },
};
