const ts = require('typescript');
const { commonCompilerOptions, transformerFactory } = require('@cocojs/compiler');

function compileTs(files) {
    const outputs = {};

    const compilerOptions = {
        ...commonCompilerOptions,
    };

    const host = ts.createCompilerHost(compilerOptions);

    // 虚拟文件系统
    host.readFile = (fileName) => files[fileName];
    host.fileExists = (fileName) => fileName in files;

    host.getSourceFile = (fileName, languageVersion) => {
        const sourceText = files[fileName];
        if (sourceText == null) return undefined;
        return ts.createSourceFile(fileName, sourceText, languageVersion, true);
    };

    host.writeFile = (fileName, content) => {
        outputs[fileName] = content;
    };

    const program = ts.createProgram({
        rootNames: Object.keys(files),
        options: compilerOptions,
        host,
    });

    program.emit(undefined, host.writeFile, undefined, undefined, { before: [transformerFactory()] });

    return outputs;
}

module.exports.compileTs = compileTs
