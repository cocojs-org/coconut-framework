import ts, { SyntaxKind, TypeChecker } from 'typescript';

function transformer(
    modifier: ts.Decorator,
    node: ts.MethodDeclaration,
    sourceFile: ts.SourceFile,
    checker?: TypeChecker
): ts.Expression[] {
    // 从方法的返回类型获取类型信息
    let typeIdentifier: ts.Identifier | undefined;

    if (node.type && ts.isTypeReferenceNode(node.type)) {
        const tn = node.type.typeName;
        const id = ts.isIdentifier(tn) ? tn : ts.isQualifiedName(tn) ? tn.right : undefined;

        if (id) {
            const text = id.getText(sourceFile);
            // 原始类型与包装类：不解析
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
                // 不设置 typeIdentifier，保持为 undefined
            } else {
                // 如果有 TypeChecker，使用它来验证类型
                if (checker) {
                    const result = resolveInjectableOrUndefined(id, checker);
                    typeIdentifier = result.length > 0 ? id : undefined;
                } else {
                    // 没有 TypeChecker 时的回退逻辑：只允许帕斯卡命名的标识符
                    if (/^[A-Z]/.test(text)) {
                        typeIdentifier = id;
                    }
                }
            }
        }
    }

    // 创建参数数组
    const argumentsArray = typeIdentifier ? [typeIdentifier] : [];
    return argumentsArray;
}

function resolveInjectableOrUndefined(id: ts.Identifier, checker: TypeChecker): ts.Expression[] {
    const symbol = checker.getSymbolAtLocation(id);

    // 使用驼峰命名法判断是否是类名
    const className = id.getText();
    if (!className || className.charAt(0) !== className.charAt(0).toUpperCase()) {
        return [];
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
        return [];
    }

    // 如果没有找到符号，说明可能是未定义的类，返回空数组
    if (!symbol) {
        return [];
    }

    // 若解析到的是变量，看看是否包装类实例
    const decls = symbol.getDeclarations() ?? [];

    // 如果没有找到声明，检查符号标志来判断类型
    if (decls.length === 0) {
        // 如果符号标志包含 Variable 或 Function，说明是变量或函数，返回空数组
        if (symbol.flags & (ts.SymbolFlags.Variable | ts.SymbolFlags.Function)) {
            return [];
        }
        // 其他情况（如外部类）当作类名处理
        return [id];
    }

    for (const d of decls) {
        // 如果是变量声明，检查是否是包装类实例
        if (ts.isVariableDeclaration(d) && d.initializer && ts.isCallExpression(d.initializer)) {
            const callee = d.initializer.expression.getText();
            // 检查是否是包装类的构造函数调用
            if (['String', 'Number', 'Boolean', 'Object', 'Array', 'Function', 'Symbol'].includes(callee)) {
                return [];
            }
        }
        // 如果是变量声明但不是包装类实例，也返回空数组
        if (ts.isVariableDeclaration(d)) {
            return [];
        }
        // 如果是函数声明，返回空数组
        if (ts.isFunctionDeclaration(d)) {
            return [];
        }
        // 如果是类型别名或接口声明，返回空数组
        if (ts.isTypeAliasDeclaration(d) || ts.isInterfaceDeclaration(d)) {
            return [];
        }
    }

    // 符合类名命名规范且不是变量/函数声明，返回该标识符
    return [id];
}

export const config = [{ name: 'component', kind: SyntaxKind.MethodDeclaration, transformer }];
