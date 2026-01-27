/**
 * coco自身功能测试配置文件
 */
const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxConcurrency: 1,
    testEnvironment: 'jsdom',
    testMatch: [
        '<rootDir>/packages/coco-cli/**/__tests__/**/*.test.(ts|tsx)',
        '<rootDir>/packages/coco-ioc-container/**/__tests__/**/*.test.(ts|tsx)',
        '<rootDir>/packages/coco-mvc/**/__tests__/**/*.test.(ts|tsx)',
        '<rootDir>/packages/coco-render/**/__tests__/**/*.test.(ts|tsx)',
        '<rootDir>/packages/coco-router/**/__tests__/**/*.test.(ts|tsx)',
        '<rootDir>/packages/coco-view/**/__tests__/**/*.test.(ts|tsx)',
    ],
    testPathIgnorePatterns: [],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '\\.[jt]sx?$': '<rootDir>/scripts/jest/transform.js',
    },
    moduleNameMapper: {
        '@cocojs/mvc': '<rootDir>/packages/coco-mvc/dist/index.cjs.js',
    },
    globals: {
        __DEV__: false,
        __TEST__: true,
    },
};
