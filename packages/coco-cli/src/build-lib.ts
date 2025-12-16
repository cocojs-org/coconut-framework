import path from 'node:path';
import { rollup } from 'rollup';
import process from 'node:process';
import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import cocojs from '@cocojs/rollup-plugin-mvc';
import { configFileName, defaultConfigName } from './util/env';
import fs from 'node:fs';

async function readRollup(cmd?: string) {
    const filename = cmd ? configFileName(cmd) : defaultConfigName;
    const filepath = path.resolve(process.cwd(), `config/${filename}`);
    if (!fs.existsSync(filepath)) {
        console.warn(`配置文件不存在：${filepath}`);
        return {};
    }
    const content = (await import(filepath))?.default;
    return content?.rollup ?? {};
}

// 目前 rollup 的配置仅支持简单的自定义，后续有需求再增强
function mergeRollupConfig(config1: any, config2: any) {
    const validKeys = ['cocoId'];
    const _config1 = {};
    const _config2 = {};
    for (const key of validKeys) {
        _config1[key] = (typeof config1 !== 'object' || config1 === null) ? config1[key] : undefined;
        _config2[key] = (typeof config2 !== 'object' || config2 === null) ? config2[key] : undefined;
    }
    return Object.assign({}, _config1, _config2);
}

async function getRollupConfig() {
    const baseConfig = await readRollup();
    const envConfig = await readRollup('build');
    return mergeRollupConfig(baseConfig, envConfig);
}

export const build = async () => {
    const config = await getRollupConfig();
    console.info('rollup config', config);
    const result = await rollup({
        input: path.join(process.cwd(), './src/index.ts'),
        plugins: [
            cocojs(),
            typescript({
                compilerOptions: {
                    target: 'ESNext',
                    lib: ['dom', 'esnext'],
                    declaration: true,
                    declarationDir: './dist/types',
                    jsx: 'preserve',
                    resolveJsonModule: true,
                    plugins: [
                        {
                            transform: '@cocojs/type-extractor',
                            transformProgram: true,
                        },
                    ],
                },
            }),
            babel({
                extensions: ['.js', '.jsx', '.ts', '.tsx'],
                plugins: [
                    [require.resolve('@babel/plugin-proposal-decorators'), { version: '2023-11' }],
                    [
                        require.resolve('@babel/plugin-transform-react-jsx', {
                            paths: [path.resolve(__dirname, '..', '../node_modules')],
                        }),
                        {
                            runtime: 'automatic',
                            importSource: '@cocojs/mvc',
                        },
                    ],
                ],
            }),
        ],
    });
    await result.write({
        file: path.join(process.cwd(), './dist/index.esm.js'),
        format: 'es',
    });
};
