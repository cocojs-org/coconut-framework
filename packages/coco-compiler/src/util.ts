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

function createImport(className: string, importPath: string) {
    return ts.factory.createImportDeclaration(
        undefined, // modifiers
        ts.factory.createImportClause(
            false,
            undefined,
            ts.factory.createNamedImports([
                ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(className)),
            ])
        ),
        ts.factory.createStringLiteral(importPath), // 路径
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
    for (const stmt of sourceFile.statements) {
        if (importNames.size === 0) {
            newStatements.push(stmt);
            continue;
        }
        if (ts.isImportDeclaration(stmt)) {
            if (stmt.importClause.namedBindings?.kind === ts.SyntaxKind.NamedImports) {
                const findImport = stmt.importClause.namedBindings.elements.find(e => importNames.has(e.name.text));
                if (findImport) {
                    const name = findImport.name.text;
                    const importPath = (<ts.StringLiteral>stmt.moduleSpecifier).text;
                    newStatements.push(createImport('Render', 'coco-render'));
                    importNames.delete(name);
                }
            }
        }
        newStatements.push(stmt);
    }
    return ts.factory.updateSourceFile(sourceFile, newStatements);
}
export { isDecoratorExp, extractIdentifierFromType, hasClassKindDecorator, updateTypeImports };
