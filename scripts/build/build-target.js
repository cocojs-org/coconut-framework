const path = require('node:path');
const process = require('node:process');

const isTest = process.env.NODE_ENV === 'test';
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

const rollupPluginAssignClassSsid = path.join(packages, './coco-rollup-plugin-assign-class-ssid');
const rollupPluginAssignClassSsidInput = path.join(rollupPluginAssignClassSsid, './src/index.ts');
const rollupPluginAssignClassSsidOutput = path.join(rollupPluginAssignClassSsid, './dist/index.cjs.js');

module.exports.rollupTargets = [
    {
        input: rollupPluginAssignClassSsidInput,
        output: {
            file: rollupPluginAssignClassSsidOutput,
            format: 'cjs',
        },
        alias: [],
        ignoreRollupPlugin: true
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
            PACKAGE.REACT_SHARED,
        ],
    },
    {
        input: cliSrc,
        output: {
            file: cliDist,
            format: 'cjs'
        },
        ignoreRollupPlugin: true
    },
    {
        input: cliBuildDotCocoProcess,
        output: {
            file: cliBuildCotCocoDist,
            format: 'cjs'
        },
        ignoreRollupPlugin: true
    },
    {
        input: cliWebpackProcess,
        output: {
            file: cliWebpackDist,
            format: 'cjs'
        },
        ignoreRollupPlugin: true
    }
];
