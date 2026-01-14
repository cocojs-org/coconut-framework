const rollup = require('rollup');
const resolve = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const babel = require('@rollup/plugin-babel');
const typescript = require('@rollup/plugin-typescript');
const aliasPlugin = require('@rollup/plugin-alias');
const genEntries = require('./rollup-alias').genEntries;
const { babelOptions } = require('../shared/common-compiler-option')
const { isTest } = require('../shared/constant');

function genRollupConfig (inputConfig) {
    const { input, alias, external, useRollupPlugin, useNodeResolve } = inputConfig

    let cocoCompiler;
    if (useRollupPlugin) {
        cocoCompiler = require('../../packages/coco-mvc-rollup-plugin/dist/index.cjs')
    }

    return {
        input,
        external,
        plugins: [
            replace({
                __DEV__: isTest,
                __TEST__: isTest,
            }),
            cocoCompiler && cocoCompiler(),
            !useRollupPlugin && typescript({
                compilerOptions: {
                    target: 'ESNext',
                    lib: ['dom'],
                    module: 'ESNext',
                    jsx: 'preserve',
                }
            }),
            !!useNodeResolve && resolve({
                extensions: ['.js', '.ts']
            }),
            babel({
                extensions: ['.js', '.ts', '.tsx'],
                ...babelOptions,
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

async function build(targets) {
    try {
        for (const { output, ...rest } of targets) {
            const rollupConfig = genRollupConfig(rest);
            const result = await rollup.rollup(rollupConfig)
            await result.write(output)
        }
    } catch (e) {
        console.error('rollup rollup error', e);
        throw e;
    }
}

module.exports.build = build;
