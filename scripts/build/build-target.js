const path = require('node:path');
const { isTest } = require('../shared/constant');
const { PACKAGE } = require("./rollup-alias");

const packages = path.join(__dirname, '../../packages');
const cocoMvc = path.join(packages, './coco-mvc');
const cocoMvcInput = path.join(cocoMvc, './src/index.ts');
const cocoMvcInputTest = path.join(cocoMvc, './src/test.ts');
const cocoMvcOutput = path.join(cocoMvc, './dist/index.cjs.js');
const cocoCli = path.join(packages, './coco-cli');
const cliSrc = path.join(cocoCli, './src/index.ts');
const cliDist = path.join(cocoCli, '/dist/index.js');
const cliBuildDotCocoProcess = path.join(cocoCli, './src/build-dot-coco-process/index.ts');
const cliBuildCotCocoDist = path.join(cocoCli, '/dist/build-dot-coco-process/index.js');
const cliWebpackProcess = path.join(cocoCli, './src/webpack-process/index.ts');
const cliWebpackDist = path.join(cocoCli, '/dist/webpack-process/index.js');
const cocoCompiler = path.join(packages, './coco-compiler');
const cocoCompilerInput = path.join(cocoCompiler, './src/index.ts');
const cocoCompilerOutput = path.join(cocoCompiler, './dist/index.cjs.js');
const cocoMvcRollupPlugin = path.join(packages, './coco-mvc-rollup-plugin');
const cocoMvcRollupPluginInput = path.join(cocoMvcRollupPlugin, './src/index.ts');
const cocoMvcRollupPluginOutput = path.join(cocoMvcRollupPlugin, './dist/index.cjs.js');
const cocoMvcWebpackLoader = path.join(packages, './coco-mvc-webpack-loader');
const cocoMvcWebpackLoaderInput = path.join(cocoMvcWebpackLoader, './src/index.ts');
const cocoMvcWebpackLoaderOutput = path.join(cocoMvcWebpackLoader, './dist/index.cjs.js');

module.exports.rollupTargets = [
    {
        input: cocoCompilerInput,
        output: {
            file: cocoCompilerOutput,
            format: 'cjs',
        },
        useRollupPlugin: false
    },
    {
        input: cocoMvcRollupPluginInput,
        output: {
            file: cocoMvcRollupPluginOutput,
            format: 'cjs',
        },
        alias: [
            PACKAGE.TS_COMPILER,
        ],
        useRollupPlugin: false
    },
    {
        input: cocoMvcWebpackLoaderInput,
        output: {
            file: cocoMvcWebpackLoaderOutput,
            format: 'cjs',
        },
        alias: [
            PACKAGE.TS_COMPILER,
        ],
        useRollupPlugin: false
    },
    {
        input: isTest ? cocoMvcInputTest : cocoMvcInput,
        output: {
            file: cocoMvcOutput,
            format: 'cjs',
        },
        alias: [
            PACKAGE.MVC_RENDER,
            PACKAGE.VIEW,
            PACKAGE.ROUTER,
            PACKAGE.IOC_CONTAINER,
            PACKAGE.SHARED,
            PACKAGE.REACT,
            PACKAGE.REACT_DOM,
            PACKAGE.REACT_DOM_HOST_CONFIG,
            PACKAGE.REACT_RECONCILER,
            PACKAGE.REACT_RECONCILER_REACT_WORK_TAGS,
            PACKAGE.REACT_SHARED
        ],
        useRollupPlugin: true,
        useNodeResolve: true,
    },
    {
        input: cliSrc,
        output: {
            file: cliDist,
            format: 'cjs'
        },
        useRollupPlugin: false
    },
    {
        input: cliBuildDotCocoProcess,
        output: {
            file: cliBuildCotCocoDist,
            format: 'cjs'
        },
        useRollupPlugin: false
    },
    {
        input: cliWebpackProcess,
        output: {
            file: cliWebpackDist,
            format: 'cjs'
        },
        useRollupPlugin: false
    }
];
