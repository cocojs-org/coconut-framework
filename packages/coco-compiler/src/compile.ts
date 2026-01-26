import * as ts from 'typescript';
import transformerFactory from './transformer';

const commonCompilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    emitDecoratorMetadata: false,
};

function compile(files: string[], outDir: string) {
    const tsOptions = {
        ...commonCompilerOptions,
        outDir,
    };
    const host = ts.createCompilerHost(tsOptions);
    const program = ts.createProgram({
        rootNames: files,
        options: tsOptions,
        host,
    });

    const emitResult = program.emit(undefined, undefined, undefined, undefined, {
        before: [transformerFactory()],
    });

    const diagnostics = ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
    return diagnostics;
}

function compileOneFile(code: string, fileName: string, prefix: string = ''): { code: string; map?: string } {
    const result = ts.transpileModule(code, {
        fileName,
        compilerOptions: {
            ...commonCompilerOptions,
            sourceMap: true,
        },
        transformers: {
            before: [transformerFactory(prefix)],
        },
    });

    return {
        code: result.outputText,
        map: result.sourceMapText,
    };
}

export { commonCompilerOptions, transformerFactory, compileOneFile }
