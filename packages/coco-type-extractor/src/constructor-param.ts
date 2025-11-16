import ts, { SyntaxKind, TypeChecker } from 'typescript';

function transformer(
    modifier: ts.Decorator,
    node: ts.ClassDeclaration,
    sourceFile: ts.SourceFile,
    checker: TypeChecker
): ts.Expression[] {
    function resolveInjectableOrUndefined(id: ts.Identifier): ts.Expression {
        const symbol = checker.getSymbolAtLocation(id);
        if (!symbol) return ts.factory.createIdentifier('undefined');

        // 使用驼峰命名法判断是否是类名
        const className = id.getText();
        if (!className || className.charAt(0) !== className.charAt(0).toUpperCase()) {
            return ts.factory.createIdentifier('undefined');
        }

        // 检查是否是已知的包装类名称或内置类型
        if (
            [
                'Str',
                'Num',
                'Bool',
                'Obj',
                'Arr',
                'Fn',
                'Sym',
                'Set',
                'Map',
                'Record',
                'Promise',
                'Date',
                'RegExp',
                'Error',
                'ArrayBuffer',
                'DataView',
                'Int8Array',
                'Uint8Array',
                'Uint8ClampedArray',
                'Int16Array',
                'Uint16Array',
                'Int32Array',
                'Uint32Array',
                'Float32Array',
                'Float64Array',
                'BigInt64Array',
                'BigUint64Array',
            ].includes(className)
        ) {
            return ts.factory.createIdentifier('undefined');
        }

        // 若解析到的是变量，看看是否包装类实例
        const decls = symbol.getDeclarations() ?? [];

        // 如果没有找到声明，检查符号标志来判断类型
        if (decls.length === 0) {
            // 如果符号标志包含 Variable 或 Function，说明是变量或函数，返回 undefined
            if (symbol.flags & (ts.SymbolFlags.Variable | ts.SymbolFlags.Function)) {
                return ts.factory.createIdentifier('undefined');
            }
            // 其他情况（如外部类）当作类名处理
        }

        for (const d of decls) {
            // 如果是变量声明，检查是否是包装类实例
            if (ts.isVariableDeclaration(d) && d.initializer && ts.isCallExpression(d.initializer)) {
                const callee = d.initializer.expression.getText();
                // 检查是否是包装类的构造函数调用
                if (['String', 'Number', 'Boolean', 'Object', 'Array', 'Function', 'Symbol'].includes(callee)) {
                    return ts.factory.createIdentifier('undefined');
                }
            }
            // 如果是变量声明但不是包装类实例，也返回 undefined
            if (ts.isVariableDeclaration(d)) {
                return ts.factory.createIdentifier('undefined');
            }
            // 如果是函数声明，返回 undefined
            if (ts.isFunctionDeclaration(d)) {
                return ts.factory.createIdentifier('undefined');
            }
            // 如果是类型别名或接口声明，返回 undefined
            if (ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d)) {
                return ts.factory.createIdentifier('undefined');
            }
        }

        // 符合类名命名规范且不是变量/函数声明，返回该标识符
        return id;
    }
    const constructorNode = node.members.find((member) => ts.isConstructorDeclaration(member)) as
        | ts.ConstructorDeclaration
        | undefined;
    const params: ts.Expression[] = [];
    if (constructorNode) {
        constructorNode.parameters.forEach((param) => {
            const t = param.type;
            // 无类型或非引用类型：使用 undefined
            if (!t || !ts.isTypeReferenceNode(t)) {
                params.push(ts.factory.createIdentifier('undefined'));
                return;
            }

            const tn = t.typeName;
            const id = ts.isIdentifier(tn) ? tn : ts.isQualifiedName(tn) ? tn.right : undefined;
            if (!id) {
                params.push(ts.factory.createIdentifier('undefined'));
                return;
            }

            const text = id.getText(sourceFile);
            // 原始类型与包装类：使用 undefined
            if (
                [
                    'String',
                    'Number',
                    'Boolean',
                    'Object',
                    'Array',
                    'Function',
                    'Symbol',
                    'string',
                    'number',
                    'boolean',
                    'object',
                    'any',
                    'unknown',
                    'void',
                    'symbol',
                ].includes(text)
            ) {
                params.push(ts.factory.createIdentifier('undefined'));
                return;
            }

            // 使用 TypeChecker 解析类型，只有真正的类才注入
            params.push(resolveInjectableOrUndefined(id));
        });
        // 期望返回单个参数：把所有参数聚合为一个数组字面量
        return [ts.factory.createArrayLiteralExpression(params)];
    }
    // 无构造参数时同样返回空数组字面量作为唯一入参
    return [ts.factory.createArrayLiteralExpression(params)];
}

export const config = [{ kind: SyntaxKind.ClassDeclaration, name: 'constructorParam', transformer }];
