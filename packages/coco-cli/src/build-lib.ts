import path from 'node:path';
import { rollup } from 'rollup';
import process from 'node:process';
import babel from '@rollup/plugin-babel';
import cocoCompiler from '@cocojs/rollup-plugin-mvc';
import { configFileName, defaultConfigName } from './util/env';
import fs from 'node:fs';

enum ValidProp {
    cocojs = 'cocojs',
}

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
    const validKeys = [ValidProp.cocojs];
    const _config1 = {};
    const _config2 = {};
    for (const key of validKeys) {
        if (config1?.[key] !== undefined) {
            _config1[key] = config1[key];
        }
        if (config2?.[key] !== undefined) {
            _config2[key] = config2[key];
        }
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
    const result = await rollup({
        input: path.join(process.cwd(), './src/index.ts'),
        plugins: [
            cocoCompiler(config[ValidProp.cocojs]),
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
