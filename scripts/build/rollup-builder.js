const rollup = require('rollup');
const replace = require('@rollup/plugin-replace');
const babel = require('@rollup/plugin-babel');
const typescript = require('@rollup/plugin-typescript');
const aliasPlugin = require('@rollup/plugin-alias');
const { isTest } = require('../shared/constant');
const path = require('node:path');
const { PACKAGE, genEntries } = require("./rollup-alias");

const packages = path.join(__dirname, '../../packages');
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
const bundleRollup = path.join(packages, './coco-bundle-rollup');
const bundleRollupInput = path.join(bundleRollup, './src/index.ts');
const bundleRollupOutput = path.join(bundleRollup, './dist/index.cjs.js');
const bundleWebpack = path.join(packages, './coco-bundle-webpack');
const bundleWebpackInput = path.join(bundleWebpack, './src/index.ts');
const bundleWebpackOutput = path.join(bundleWebpack, './dist/index.cjs.js');
const webpackLoaderInput = path.join(bundleWebpack, './src/coco-mvc-loader.ts');
const webpackLoaderOutput = path.join(bundleWebpack, './dist/coco-mvc-loader.js');

// 一般打包对象，没有使用cocojs特性
const generalTargets = [
    {
        input: cocoCompilerInput,
        output: {
            file: cocoCompilerOutput,
            format: 'cjs',
        }
    },
    {
        input: bundleRollupInput,
        output: {
            file: bundleRollupOutput,
            format: 'cjs',
        },
        alias: [
            PACKAGE.TS_COMPILER,
        ],
    },
    {
        input: bundleWebpackInput,
        output: {
            file: bundleWebpackOutput,
            format: 'cjs',
        },
        alias: [],
    },
    {
        input: webpackLoaderInput,
        output: {
            file: webpackLoaderOutput,
            format: 'cjs',
        },
        alias: [
            PACKAGE.TS_COMPILER,
        ],
    },
    {
        input: cliSrc,
        output: {
            file: cliDist,
            format: 'cjs'
        },
    },
    {
        input: cliBuildDotCocoProcess,
        output: {
            file: cliBuildCotCocoDist,
            format: 'cjs'
        },
    },
    {
        input: cliWebpackProcess,
        output: {
            file: cliWebpackDist,
            format: 'cjs'
        },
        alias: [
            PACKAGE.BUNDLE_WEBPACK,
        ],
    }
];

function genRollupConfig (inputConfig) {
    const { input, alias, external } = inputConfig

    return {
        input,
        external,
        plugins: [
            replace({
                __DEV__: isTest,
                __TEST__: isTest,
            }),
            typescript({
                compilerOptions: {
                    target: 'ESNext',
                    lib: ['dom'],
                    module: 'ESNext',
                    jsx: 'preserve',
                }
            }),
            babel({
                extensions: ['.js', '.ts', '.tsx'],
                presets: ['@babel/preset-env'],
            }),
            aliasPlugin({
                entries: genEntries(alias)
            }),
        ],
        onLog(level, log, handler) {
            if (log.code === 'CIRCULAR_DEPENDENCY') {
                throw new Error(log);
            }
        }
    }
}

async function build() {
    try {
        for (const { output, ...rest } of generalTargets) {
            const rollupConfig = genRollupConfig(rest);
            const result = await rollup.rollup(rollupConfig)
            await result.write(output)
        }
    } catch (e) {
        console.error('rollup rollup error', e);
        throw e;
    }
}

module.exports = build;
