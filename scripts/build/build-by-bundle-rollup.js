/**
 * 需要使用@cocojs/bundle-rollup打包的库
 */
const path = require('node:path');
const resolve = require('@rollup/plugin-node-resolve');
const aliasPlugin = require('@rollup/plugin-alias');
const replace = require('@rollup/plugin-replace');
const packages = path.join(__dirname, '../../packages');
const cocoMvc = path.join(packages, './coco-mvc');
const cocoMvcInput = path.join(cocoMvc, './src/index.ts');
const cocoMvcInputTest = path.join(cocoMvc, './src/test.ts');
const cocoMvcOutput = path.join(cocoMvc, './dist/index.cjs.js');
const cocoMvcOutputEsm = path.join(cocoMvc, './dist/index.esm.js');
const { isTest } = require('../shared/constant');
const { genEntries, PACKAGE } = require('./rollup-alias');

const cocoTargets = [
    {
        input: isTest ? cocoMvcInputTest : cocoMvcInput,
        output: [
            {
                file: cocoMvcOutput,
                format: 'cjs',
            }, {
                file: cocoMvcOutputEsm,
                format: 'es',
            }
        ],
        plugins: [
            replace({
                __DEV__: isTest,
                __TEST__: isTest,
            }),
            resolve({
                extensions: ['.js', '.ts']
            }),
            aliasPlugin({
                entries: genEntries([
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
                ])
            }),
        ]
    }
]

async function buildCoco () {
    /**
     * 首次加载这个文件 @cocojs/bundle-rollup 还没有打包出来，会导致报错。
     * 所以这里需要动态引入。
     */
    const { bundle: rollupRunner } = require("@cocojs/bundle-rollup");
    for (const target of cocoTargets) {
        await rollupRunner(target);
    }
}

module.exports = buildCoco;
