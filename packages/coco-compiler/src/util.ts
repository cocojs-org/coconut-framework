import * as ts from 'typescript';

const wrapperClassName = ['String', 'Number', 'Boolean'];
const innerClassName = ['Object', 'Symbol', 'Array', 'Map', 'Set', 'Function'];

// {}
function isObjectType(type?: ts.TypeNode): boolean {
    return !!type && ts.isTypeLiteralNode(type);
}

// []
function isTupleArray(type?: ts.TypeNode): boolean {
    return !!type && ts.isTupleTypeNode(type);
}

// () => {}
function isFunctionType(type?: ts.TypeNode): boolean {
    return !!type && ts.isFunctionTypeNode(type);
}

function isDecoratorExp(decorator: ts.Decorator, decoratorName: string): decorator is ts.Decorator {
    const expr = decorator.expression;

    return ts.isCallExpression(expr) && ts.isIdentifier(expr.expression) && expr.expression.text === decoratorName;
}

function hasClassKindDecorator(classDeclaration: ts.ClassDeclaration): boolean {
    return !!classDeclaration.modifiers?.find((modifier) => ts.isDecorator(modifier));
}

function extractIdentifierFromType(type: ts.TypeNode): ts.Identifier | undefined {
    if (ts.isTypeReferenceNode(type)) {
        if (ts.isIdentifier(type.typeName)) {
            if (
                wrapperClassName.includes(type.typeName.text) ||
                innerClassName.includes(type.typeName.text)
            ) {
                return ts.factory.createIdentifier('undefined');
            }
            return ts.factory.createIdentifier(type.typeName.text);
        }
    } else if (
        type.kind === ts.SyntaxKind.StringKeyword ||
        type.kind === ts.SyntaxKind.NumberKeyword ||
        type.kind === ts.SyntaxKind.BooleanKeyword ||
        type.kind === ts.SyntaxKind.ObjectKeyword ||
        (type && ts.isLiteralTypeNode(type) && type.literal.kind === ts.SyntaxKind.NullKeyword) ||
        type.kind === ts.SyntaxKind.UndefinedKeyword ||
        type.kind === ts.SyntaxKind.SymbolKeyword
    ) {
        return ts.factory.createIdentifier('undefined');
    } else if (
        isObjectType(type) ||
        isTupleArray(type) ||
        isFunctionType(type)
    ) {
        return ts.factory.createIdentifier('undefined');
    }

    return undefined;
}

function createNamedImport(className: string, importPath: string) {
    return ts.factory.createImportDeclaration(
        undefined, // modifiers
        ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(className)),
            ])
        ),
        ts.factory.createStringLiteral(importPath),
        undefined
    );
}

function createImport(className: string, importPath: string) {
    return ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(undefined, ts.factory.createIdentifier(className), undefined),
        ts.factory.createStringLiteral(importPath),
        undefined
    );
}

function updateTypeImports(sourceFile: ts.SourceFile, identifyList: ts.Identifier[] = []): ts.SourceFile {
    if (!identifyList.length) {
        return sourceFile;
    }
    const importNames = new Set<string>();
    identifyList.forEach((iden) => importNames.add(iden.text));
    const newStatements = [];
    for (const name of importNames) {
        for (const stmt of sourceFile.statements) {
            if (ts.isImportDeclaration(stmt)) {
                if (stmt.importClause.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
                    const match = stmt.importClause.namedBindings.elements.find((e) => name === e.name.text);
                    if (match) {
                        const importPath = (<ts.StringLiteral>stmt.moduleSpecifier).text;
                        newStatements.push(createNamedImport(name, importPath));
                        break;
                    }
                }
                if (stmt.importClause.name && ts.isIdentifier(stmt.importClause.name)) {
                    if (stmt.importClause.name.text === name) {
                        const importPath = (<ts.StringLiteral>stmt.moduleSpecifier).text;
                        newStatements.push(createImport(name, importPath));
                        break;
                    }
                }
            }
        }
    }
    return ts.factory.updateSourceFile(sourceFile, [ ...newStatements, ...sourceFile.statements]);
}
export { isDecoratorExp, extractIdentifierFromType, hasClassKindDecorator, updateTypeImports };
