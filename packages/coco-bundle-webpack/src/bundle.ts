import webpack, { type Configuration } from 'webpack';
import path from 'path';
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

interface Hook {
    // webpack compiler 创建后执行
    created?: (compiler: Webpack.Compiler) => void;
}

/**
 * 运行一次代码构建
 * @param noCommonLoaderConfig 除了公共loader外的配置，如果是多个配置，也是按序作为webpack-merge的参数
 * @param hook 打包过程中非webpack配置项，自定义工作流
 */
async function bundle(noCommonLoaderConfig: Configuration | Configuration[], hook: Hook = {}) {
    const { created } = hook;
    const configList = Array.isArray(noCommonLoaderConfig) ? noCommonLoaderConfig : [noCommonLoaderConfig];
    const finalConfig = merge(commonLoaderConfig, ...configList);
    const compiler = webpack(finalConfig);
    if (!compiler) {
        return Promise.reject('创建webpack compiler 实例失败')
    }

    if (created) {created(compiler)}

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

/**
 * 启动开发服务器
 * @param noCommonLoaderConfig 除了公共loader外的配置，如果是多个配置，也是按序作为webpack-merge的参数
 */
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
