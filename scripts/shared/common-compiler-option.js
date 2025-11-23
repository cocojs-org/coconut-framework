/**
 * 统一构建和测试使用的ts配置和babel配置
 */
const typescriptOptions = {
  target: 'es2015',
  lib: ['dom'],
  module: 'ESNext',
  jsx: 'preserve',
  plugins: [
    {
      transform: '@cocojs/type-extractor',
      transformProgram: true,
    },
  ],
};

const babelOptions = {
  presets: ['@babel/preset-env'],
  plugins: [['@babel/plugin-proposal-decorators', { version: '2023-11' }]],
};

module.exports = { typescriptOptions, babelOptions };
