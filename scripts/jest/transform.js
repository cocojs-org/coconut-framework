const { default: babelJest } = require('babel-jest');
const { compileOneFile } = require('../../packages/coco-compiler');

module.exports = {
    process(src, filename, transformOptions) {
        if (
            filename.endsWith('.tsx') ||
            filename.endsWith('.ts') ||
            filename.endsWith('.jsx') ||
            filename.endsWith('.js')
        ) {
            const { code } = compileOneFile(src, filename);
            const transformer = babelJest.createTransformer({
                presets: ['@babel/preset-env'],
                plugins: [
                    [
                        '@babel/plugin-transform-react-jsx',
                        { runtime: 'automatic', importSource: '@cocojs/mvc' },
                    ],
                    ['@babel/plugin-proposal-decorators', { version: '2023-11' }]
                ],
            });
            return transformer.process(code, filename, transformOptions);
        }
        return { code: src };
    },
};
