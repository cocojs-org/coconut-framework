import * as ts from 'typescript';
import { commonCompilerOptions, transformerFactory } from '../../dist';

export function compileTs(files: Record<string, string>) {
    const outputs: Record<string, string> = {};

    const compilerOptions: ts.CompilerOptions = {
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
