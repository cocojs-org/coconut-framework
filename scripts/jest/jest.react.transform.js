const { createTransformer } = require('../../packages/coco-assign-class-id-transformer');
const { babelOptions } = require('../shared/common-compiler-option');
const { default: babelJest } = require('babel-jest');

module.exports = {
    process(src, filename, transformOptions) {
        if (filename.endsWith('.jsx') || filename.endsWith('.js')) {
            const ssidTransformer = createTransformer(console.warn, (error) => {
                throw new Error(error);
            });
            const result = ssidTransformer(src, filename);
            const code = result ? result : src;
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
