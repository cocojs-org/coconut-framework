const ts = require('typescript');
const babelJest = require('babel-jest').default;
const { typescriptOptions, babelOptions } = require('../shared/common-compiler-option');

module.exports = {
    process(src, filename, transformOptions) {
        if (filename.endsWith('.ts') || filename.endsWith('.tsx')) {
            const { outputText } = ts.transpileModule(src, {
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
