const path = require('path');

module.exports = {
    rootDir: path.join(__dirname, '../..'),
    cache: false,
    maxConcurrency: 1,
    testEnvironment: 'jsdom',
    testMatch: ['**/__tests__/**/*.test.(ts|tsx)'],
    testPathIgnorePatterns: [
        '<rootDir>/packages/react/',
        '<rootDir>/packages/react-dom/',
        '<rootDir>/packages/react-reconciler/',
        '<rootDir>/packages/react-shared/',
    ],
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    transform: {
        '\\.[jt]sx?$': '<rootDir>/scripts/jest/jest.coconut.transform.js',
    },
    moduleNameMapper: {
        '@cocojs/mvc': '<rootDir>/packages/coco-mvc/dist/index.cjs.js',
    },
    globals: {
        __DEV__: false,
        __TEST__: true,
    },
};
