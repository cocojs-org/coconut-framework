const ts = require('typescript');
const babelJest = require('babel-jest').default;
const { typescriptOptions, babelOptions } = require('../shared/common-compiler-option');
const { createTransformer } = require('../../packages/coco-assign-class-ssid-transformer');

module.exports = {
    process(src, filename, transformOptions) {
        if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
            const ssidTransformer = createTransformer(console.warn, error => {throw new Error(error);});
            const result = ssidTransformer(src, filename);
            const code = result ? result : src;
            const { outputText } = ts.transpileModule(code, {
                compilerOptions: {
                    moduleResolution: 'node',
                    allowSyntheticDefaultImports: true,
                    resolveJsonModule: true,
                    ...typescriptOptions,
                },
                fileName: filename,
            });

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
            return transformer.process(outputText, filename, transformOptions);
        }
        return { code: src };
    },
};
