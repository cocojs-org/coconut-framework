import * as ts from 'typescript';
import transformerFactory from './transformer';

const commonCompilerOptions: ts.CompilerOptions = {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    emitDecoratorMetadata: false,
};

function compileOneFile(
    code: string,
    fileName: string,
    prefix: string = '',
    addConstructorInjectImportStmt?: 'coco-ioc-container' | '@cocojs/mvc'
): { code: string; map?: string } {
    const result = ts.transpileModule(code, {
        fileName,
        compilerOptions: {
            ...commonCompilerOptions,
            sourceMap: true,
        },
        transformers: {
            before: [transformerFactory(prefix, addConstructorInjectImportStmt)],
        },
    });

    return {
        code: result.outputText,
        map: result.sourceMapText,
    };
}

export { commonCompilerOptions, compileOneFile }
