import HtmlWebpackPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import path from 'node:path';
import fs from 'node:fs';
import { merge } from 'webpack-merge';
import { configFileName, defaultConfigName } from '../util/env';

async function readWebpack(cmd?: string) {
  const filename = cmd ? configFileName(cmd) : defaultConfigName;
  const filepath = path.resolve(process.cwd(), `config/${filename}`);
  if (!fs.existsSync(filepath)) {
    console.warn(`配置文件不存在：${filepath}`);
    return {};
  }
  // TODO: .default 有没有优雅的写法？
  const content = (await import(filepath))?.default;
  return content?.webpack ?? {}; // Merging undefined is not supported
}

const buildInConfig = {
  mode: 'production',
  entry: path.join(process.cwd(), './src/.coco/index.tsx'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [require.resolve('@babel/preset-typescript')],
              plugins: [
                [
                  require.resolve('@babel/plugin-proposal-decorators'),
                  { version: '2023-11' },
                ],
                [
                  require.resolve('@babel/plugin-transform-react-jsx'),
                  {
                    runtime: 'automatic',
                    importSource: 'coco-mvc',
                  },
                ],
              ],
            },
          },
          {
            loader: 'ts-loader',
            options: {
              context: process.cwd(),
              transpileOnly: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
    ],
  },
  resolveLoader: {
    modules: [path.resolve(__dirname, '../../node_modules'), 'node_modules'],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      '@': path.resolve(process.cwd(), 'src/'),
    },
  },
  output: {
    publicPath: '/',
    filename: 'main.js',
    path: path.join(process.cwd(), 'dist'),
    clean: true,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          keep_classnames: true,
        },
      }),
    ],
  },
  devServer: {
    static: {
      directory: path.join(process.cwd(), 'dist'),
    },
    compress: true,
    historyApiFallback: true,
    port: 9700,
    devMiddleware: {
      writeToDisk: true,
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      templateContent: `
<!DOCTYPE html>
<html lang="en">
<body>
  <div id="root"></div>
</body>
</html>
  `,
    }),
  ],
};

async function getWebpackConfig(cmd: string) {
  const baseConfig = await readWebpack();
  const envConfig = await readWebpack(cmd);
  return merge(buildInConfig, baseConfig, envConfig);
}

export default getWebpackConfig;
