import ts, { SyntaxKind, Program, CompilerHost, CompilerOptions, SourceFile, TransformationContext } from 'typescript';
import { config as c1 } from './autowired';
import { config as c2 } from './component';
import { config as c3 } from './constructor-param';
import { ProgramTransformerExtras } from 'ts-patch';

const classTransformList: { decoratorName: string; transformer: Function }[] = [];
const propertyTransformList: { decoratorName: string; transformer: Function }[] = [];
const methodTransformList: { decoratorName: string; transformer: Function }[] = [];
function register(kind: ts.SyntaxKind, decoratorName: string, transformer: Function) {
    let list;
    switch (kind) {
        case SyntaxKind.ClassDeclaration:
            list = classTransformList;
            break;
        case SyntaxKind.PropertyDeclaration:
            list = propertyTransformList;
            break;
        case SyntaxKind.MethodDeclaration:
            list = methodTransformList;
            break;
        default:
            return;
    }
    const find = list.find((i) => i.decoratorName === decoratorName);
    if (!find) {
        list.push({ decoratorName, transformer });
    } else {
        // 目前一个装饰器对应一个transformer,且每个transformer也只处理对应的装饰器表达式
        throw new Error(`${decoratorName}存在多个transformer`);
    }
}

[...c1, ...c2, ...c3].forEach(({ kind, name, transformer }) => {
    register(kind, name, transformer);
});

function transformAst(tsInstance: typeof ts, context: TransformationContext, program?: Program) {
    const checker = program?.getTypeChecker();

    /* Transformer Function */
    return (sourceFile: SourceFile) => {
        return tsInstance.visitEachChild(sourceFile, visit, context);

        /* Visitor Function */
        function visit(node: ts.Node): ts.Node {
            if (ts.isClassDeclaration(node)) {
                const decorators = (node.modifiers || []).map((modifier) => {
                    // 检查是否是装饰器
                    if (ts.isDecorator(modifier)) {
                        const decoratorExpression = modifier.expression;
                        let find;
                        // 检查是否是装饰器调用（如 @a()）
                        if (
                            ts.isCallExpression(decoratorExpression) &&
                            decoratorExpression.arguments.length === 0 &&
                            ts.isIdentifier(decoratorExpression.expression) &&
                            (find = classTransformList.find(
                                (i) => i.decoratorName === decoratorExpression.expression.getText(sourceFile)
                            ))
                        ) {
                            const args = find.transformer(modifier, node, sourceFile, checker);
                            return ts.factory.updateDecorator(
                                modifier,
                                ts.factory.updateCallExpression(
                                    decoratorExpression,
                                    decoratorExpression.expression,
                                    undefined,
                                    args
                                )
                            );
                        }
                    }
                    return modifier;
                });
                return ts.factory.updateClassDeclaration(
                    node,
                    decorators,
                    node.name,
                    node.typeParameters,
                    node.heritageClauses,
                    ts.visitNodes(node.members, visit) as unknown as ts.ClassElement[]
                );
            } else if (ts.isPropertyDeclaration(node)) {
                const decorators = (node.modifiers || []).map((modifier: ts.Decorator) => {
                    if (ts.isDecorator(modifier)) {
                        const decoratorExpression = modifier.expression;
                        // 检查是否是装饰器调用（如 @a()）
                        let find;
                        if (
                            ts.isCallExpression(decoratorExpression) &&
                            ts.isIdentifier(decoratorExpression.expression) &&
                            (find = propertyTransformList.find(
                                (i) => i.decoratorName === decoratorExpression.expression.getText(sourceFile)
                            ))
                        ) {
                            // 获取新入参
                            const args = find.transformer(modifier, node, sourceFile, checker);
                            return ts.factory.updateDecorator(
                                modifier,
                                ts.factory.updateCallExpression(
                                    decoratorExpression,
                                    decoratorExpression.expression,
                                    undefined,
                                    args
                                )
                            );
                        }
                    }
                    return modifier;
                });
                return ts.factory.updatePropertyDeclaration(
                    node,
                    decorators,
                    node.name,
                    node.questionToken,
                    node.type,
                    node.initializer
                );
            } else if (ts.isMethodDeclaration(node)) {
                const decorators = (node.modifiers || []).map((modifier: ts.Decorator) => {
                    if (ts.isDecorator(modifier)) {
                        const decoratorExpression = modifier.expression;
                        // 检查是否是装饰器调用（如 @a()）
                        let find;
                        if (
                            ts.isCallExpression(decoratorExpression) &&
                            ts.isIdentifier(decoratorExpression.expression) &&
                            (find = methodTransformList.find(
                                (i) => i.decoratorName === decoratorExpression.expression.getText(sourceFile)
                            ))
                        ) {
                            // 获取新入参
                            const args = find.transformer(modifier, node, sourceFile, checker);
                            return ts.factory.updateDecorator(
                                modifier,
                                ts.factory.updateCallExpression(
                                    decoratorExpression,
                                    decoratorExpression.expression,
                                    undefined,
                                    args
                                )
                            );
                        }
                    }
                    return modifier;
                });
                return ts.factory.updateMethodDeclaration(
                    node,
                    decorators,
                    node.asteriskToken,
                    node.name,
                    node.questionToken,
                    node.typeParameters,
                    node.parameters,
                    node.type,
                    node.body
                );
            } else {
                return ts.visitEachChild(node, visit, context);
            }
        }
    };
}

function getPatchedHost(
    maybeHost: CompilerHost | undefined,
    tsInstance: typeof ts,
    compilerOptions: CompilerOptions
): CompilerHost & { fileCache: Map<string, SourceFile> } {
    const fileCache = new Map();
    const compilerHost = maybeHost ?? tsInstance.createCompilerHost(compilerOptions, true);
    const originalGetSourceFile = compilerHost.getSourceFile;

    return Object.assign(compilerHost, {
        getSourceFile(fileName: string, languageVersion: ts.ScriptTarget) {
            fileName = tsInstance.normalizePath(fileName);
            if (fileCache.has(fileName)) return fileCache.get(fileName);

            const sourceFile = originalGetSourceFile.apply(void 0, Array.from(arguments) as any);
            fileCache.set(fileName, sourceFile);

            return sourceFile;
        },
        fileCache,
    });
}

function transformProgram(
    program: Program,
    host: CompilerHost | undefined,
    config: any,
    { ts: tsInstance }: ProgramTransformerExtras
): Program {
    const compilerOptions = program.getCompilerOptions();
    const compilerHost = getPatchedHost(host, tsInstance, compilerOptions);
    const rootFileNames = program.getRootFileNames().map(tsInstance.normalizePath);

    /* Transform AST */
    const transformedSource = tsInstance.transform(
        /* sourceFiles */ program.getSourceFiles().filter((sourceFile) => rootFileNames.includes(sourceFile.fileName)),
        /* transformers */ [(context: TransformationContext) => transformAst(tsInstance, context, program)],
        compilerOptions
    ).transformed;

    /* Render modified files and create new SourceFiles for them to use in host's cache */
    const { printFile } = tsInstance.createPrinter();
    for (const sourceFile of transformedSource) {
        const { fileName, languageVersion, version } = sourceFile;
        const updatedSourceFile = tsInstance.createSourceFile(fileName, printFile(sourceFile), languageVersion);
        updatedSourceFile.version = version;
        compilerHost.fileCache.set(fileName, updatedSourceFile);
    }

    /* Re-create Program instance */
    return tsInstance.createProgram(rootFileNames, compilerOptions, compilerHost);
}

export default transformProgram;
