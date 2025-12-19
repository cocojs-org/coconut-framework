import { parse } from '@babel/parser';
import { generate } from '@babel/generator';
import type {
    Node,
    ClassDeclaration,
    CallExpression,
    ClassExpression,
    ClassProperty,
    ClassBody,
    Identifier,
    StringLiteral, BlockStatement,
} from '@babel/types';
import * as t from '@babel/types';

const innerIdName = '$$id';

function isClassDeclaration(node: any) {
    return node.type === 'ClassDeclaration';
}

function isDescribeExpression (node: any) {
    if (
        t.isExpressionStatement(node) &&
        t.isCallExpression(node.expression) &&
        t.isIdentifier((<CallExpression>node.expression).callee, { name: 'describe' })
    ) {
        const describeCb = (<CallExpression>node.expression).arguments[1];
        if (t.isArrowFunctionExpression(describeCb) || t.isFunctionExpression(describeCb)) {
            return (<BlockStatement>describeCb.body).body;
        }
    }
    return null;
}

const isTestExpression = (node) => {
    if (
        t.isExpressionStatement(node) &&
        t.isCallExpression(node.expression) &&
        (t.isIdentifier((<CallExpression>node.expression).callee, { name: 'test' }) ||
            t.isIdentifier((<CallExpression>node.expression).callee, { name: 'it' }))
    ) {
        const testCb = node.expression.arguments[1];
        if (t.isArrowFunctionExpression(testCb)) {
            return (<BlockStatement>testCb.body).body;
        }
    }
    return null;
};

const isFunction = (node) => {
    if (t.isFunctionDeclaration(node)) {
        return (<BlockStatement>node.body).body;
    }
    return null;
};

const isTryBlock = (node) => {
    if (t.isTryStatement(node)) {
        return (<BlockStatement>node.block).body;
    }
    return null;
};

// 正式环境下只为顶层的类添加$$id
const needHandleClassBlockPathListForProd = [
    [isClassDeclaration],
];
// 测试时候，很多类定义不在顶层
const needHandleClassBlockPathListForTest = [
    [isDescribeExpression, isTestExpression, isClassDeclaration],
    [isDescribeExpression, isDescribeExpression, isTestExpression, isClassDeclaration],
    [isDescribeExpression, isDescribeExpression, isFunction, isClassDeclaration],
    [isDescribeExpression, isFunction, isClassDeclaration],
    [isDescribeExpression, isTestExpression, isTryBlock, isClassDeclaration],
    [isDescribeExpression, isDescribeExpression, isTestExpression, isTryBlock, isClassDeclaration],
];

/**
 * 创建一个transformer
 * @param warn 告警打印
 * @param error 报错打印
 * @param prefix 统一前缀，最终添加的$$id的值为`${prefix.trim()}${class.name}`
 */
function createTransformer(warn: (msg: string) => void, error: (msg: string) => void, prefix: string = '') {

    function assignStatic$$id(node: ClassDeclaration) {
        const hasDecorators = node.decorators && node.decorators.length > 0;
        // 必须有装饰器且必须有名称 (id)
        if (hasDecorators && node.id) {
            const className = node.id.name;
            const classBody = node.body as ClassBody;
            if (typeof classBody.start !== 'number' || classBody.start < 0) {
                // 插入点：ClassBody 的起始大括号 { 之后 (+1) 如果起始位置丢失或无效，这是异常情况，应跳过
                warn(`这可能是一个 bug`);
                return false;
            }
            const alreadyExists = classBody.body.some((el) => {
                // 必须是 ClassProperty 且 key 是 Identifier
                if (el.type === 'ClassProperty' && el.key.type === 'Identifier') {
                    const prop = el as ClassProperty;
                    const key = prop.key as Identifier;
                    if (!prop.static || key.name !== innerIdName) {
                        return false;
                    }
                    const value = prop.value as StringLiteral;
                    if (value.type !== 'StringLiteral') {
                        error(`想要为类${className}自定义"${innerIdName}"，值必须是字符串字面量`);
                    } else if (!value.value || value.value.trim() === '') {
                        error(`想要为类${className}自定义"${innerIdName}"，值不能是空字符串`);
                    }
                    return true;
                }
                return false;
            });
            if (alreadyExists) {
                // 已经存在就是用户显式指定
                return false;
            }
            // 插入的代码
            let innerIdValue: string;
            if (typeof prefix !== 'string' || !prefix.trim()) {
                innerIdValue = className;
            } else {
                innerIdValue = `${prefix.trim()}${className}`;
            }
            const staticIdProperty = t.classProperty(
                t.identifier(innerIdName),
                t.stringLiteral(innerIdValue),
                null,
                null,
                false,
                true
            );
            node.body.body.unshift(staticIdProperty);
            return true;
        }
        return false;
    }


    function findClassClassDeclarationNode(node: any, path: Function[]) {
        if (path.length < 1) {
            return false;
        } else if (path.length === 1) {
            if (path[0] !== isClassDeclaration) {
                // 最后一个必须是判断是否是函数定义的，如果不是的话直接报错
                throw new Error('最后一个判断应当是isClassDeclaration');
            }
            if (isClassDeclaration(node)) {
                assignStatic$$id(node);
                return true;
            } else {
                return false;
            }
        } else {
            // len > 1
            const match = path[0];
            const nextBlockList = match(node);
            if (nextBlockList) {
                let modified = false;
                for (const next of nextBlockList) {
                    const find = findClassClassDeclarationNode(next, path.slice(1));
                    if (find && !modified) {
                        modified = true;
                    }
                }
                return modified;
            } else {
                return false;
            }
        }
    }

    function transformer(code: string, id: string) {
        // 1. 过滤：只处理 TypeScript 文件
        if (!/\.(ts|tsx)$/.test(id)) {
            if (!__TEST__ || !/\.(jsx)$/.test(id)) {
                return null;
            }
        }

        // 2. 解析：启用 TypeScript 和现代装饰器语法
        const ast = parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'decorators', 'classProperties', 'jsx', 'decoratorAutoAccessors'],
        });

        const body = ast.program?.body;
        if (!body || !Array.isArray(body)) {
            return;
        }

        let regenerate = false;
        const needHandleClassBlockPathList = __TEST__
            ? [...needHandleClassBlockPathListForProd, ...needHandleClassBlockPathListForTest]
            : needHandleClassBlockPathListForProd;
        for (const blockPath of needHandleClassBlockPathList) {
            for (const statement of body) {
                const find = findClassClassDeclarationNode(statement, blockPath);
                if (find && !regenerate) {
                    regenerate = true;
                }
            }
        }

        if (regenerate) {
            const { code } = generate(ast, { compact: false, retainLines: true });
            return code;
        } else {
            return null;
        }
    }

    return transformer;
}

export default createTransformer;