const ts = require('typescript');
const path = require('path');

exports.transpile = function (src) {
    const { outputText } = ts.transpileModule(src, {
        compilerOptions: {
            target: 'ESNext',
            module: 'ESNext',
            moduleResolution: 'node',
            allowSyntheticDefaultImports: true,
            jsx: 'preserve',
            resolveJsonModule: true,
            plugins: [
                {
                    transform: path.join(__dirname, '../../dist/index.js'),
                    transformProgram: true,
                },
            ],
        },
        fileName: 'mock.ts',
    });

    return outputText;
};
