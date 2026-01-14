const babelJest = require('babel-jest').default;
const { babelOptions } = require('../../shared/common-compiler-option');
const { compileOneFile } = require('../../../packages/coco-compiler');

module.exports = {
    process(src, filename, transformOptions) {
        if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
            const { code } = compileOneFile(src, filename);
            const transformer = babelJest.createTransformer({
                presets: babelOptions.presets,
                plugins: [
                    [
                        '@babel/plugin-transform-react-jsx',
                        {
                            runtime: 'automatic',
                            importSource: '@cocojs/mvc',
                        },
                    ],
                    ...babelOptions.plugins,
                ],
            });
            return transformer.process(code, filename, transformOptions);
        }
        return { code: src };
    },
};
