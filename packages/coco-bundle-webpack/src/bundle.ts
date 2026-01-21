import webpack, { type Configuration } from 'webpack';
import path from 'path';
import { createFsFromVolume, Volume } from 'memfs';
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import { merge } from 'webpack-merge';

// 公共配置项
const commonLoaderConfig: Configuration = {
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: require.resolve('babel-loader'),
                        options: {
                            plugins: [
                                [require.resolve('@babel/plugin-proposal-decorators'), { version: '2023-11' }],
                                [
                                    require.resolve('@babel/plugin-transform-react-jsx'),
                                    {
                                        runtime: 'automatic',
                                        importSource: '@cocojs/mvc',
                                    },
                                ],
                            ],
                        },
                    },
                    {
                        loader: path.resolve(__dirname, './coco-mvc-loader.js'),
                    },
                ],
                exclude: /node_modules/,
            },
        ],
    },
};


/**
 * 运行一次代码构建
 * @param noCommonLoaderConfig 除了公共loader外的配置
 * @param flowOpt 控制执行一次打包过程中非webpack配置的选项，用于控制打包流
 */
interface FlowOpt {
    enableMemoryFs?: boolean;
}
async function bundle(noCommonLoaderConfig: Configuration | Configuration[], flowOpt: FlowOpt = {}) {
    const { enableMemoryFs } = flowOpt;
    const configList = Array.isArray(noCommonLoaderConfig) ? noCommonLoaderConfig : [noCommonLoaderConfig];
    const finalConfig = merge(commonLoaderConfig, ...configList);
    const compiler = webpack(finalConfig);
    if (!compiler) {
        return Promise.reject('创建webpack compiler 实例失败')
    }
    if (enableMemoryFs) {
        const memoryFs = createFsFromVolume(new Volume());
        compiler.outputFileSystem = memoryFs as unknown as any;
        compiler.outputFileSystem!.join = path.join.bind(path);
    }


    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }
            if (stats?.hasErrors()) {
                reject(stats.toJson().errors);
            }
            resolve(stats);
            compiler.close(() => {});
        });
    });
}

async function startDev(noCommonLoaderConfig: Configuration | Configuration[]) {
    const configList = Array.isArray(noCommonLoaderConfig) ? noCommonLoaderConfig : [noCommonLoaderConfig];
    const finalConfig = merge(commonLoaderConfig, ...configList);
    const { devServer, ...rest } = finalConfig;
    const compiler = Webpack(rest);
    const devServerOptions = { ...devServer, open: true };
    if (!compiler) {
        throw new Error('创建webpack compiler 实例失败');
    }
    const server = new WebpackDevServer(devServerOptions, compiler);
    await server.start();
    return async function stop() {
        await server.stop();
    };
}

export { startDev };
export default bundle;
