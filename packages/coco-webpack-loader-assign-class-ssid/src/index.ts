import { parse } from '@babel/parser';
import MagicString from 'magic-string';

const ssidKeyName = '$$id';

function findClasses(ast, visitor) {
    if (!ast) return;

    if (Array.isArray(ast)) {
        ast.forEach(n => findClasses(n, visitor));
        return;
    }

    if (typeof ast === 'object' && ast.type) {
        const node = ast;

        if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
            visitor(node);
        }

        for (const key in node) {
            if (
                key !== 'range' &&
                key !== 'start' &&
                key !== 'end' &&
                key !== 'loc' &&
                key !== 'type'
            ) {
                const prop = node[key];
                if (prop && (typeof prop === 'object' || Array.isArray(prop))) {
                    findClasses(prop, visitor);
                }
            }
        }
    }
}

function addStaticIdLoader(source: any) {
    const filename = this.resourcePath;

    // 仅处理 ts/tsx
    if (!/\.(ts|tsx)$/.test(filename)) {
        return source;
    }

    const s = new MagicString(source);

    const ast = parse(source, {
        sourceType: 'module',
        plugins: ['decorators', 'typescript']
    });

    let modified = false;

    findClasses(ast.program.body, (node: any) => {
        const hasDecorators = node.decorators && node.decorators.length > 0;

        if (!hasDecorators || !node.id) return;

        const className = node.id.name;
        const classBody = node.body;

        if (typeof classBody.start !== 'number') {
            this.emitWarning(
                new Error(`[add-static-id-loader] Skip class in ${filename}, invalid classBody.start`)
            );
            return;
        }

        const alreadyExists = classBody.body.some(el => {
            if (el.type === 'ClassProperty' && el.key.type === 'Identifier') {
                if (!el.static || el.key.name !== ssidKeyName) {
                    return false;
                }

                const value = el.value;
                if (value.type !== 'StringLiteral') {
                    this.emitError(
                        new Error(`想要为类${className}自定义"${ssidKeyName}"，值必须是字符串字面量`)
                    );
                } else if (!value.value || value.value.trim() === '') {
                    this.emitError(
                        new Error(`想要为类${className}自定义"${ssidKeyName}"，值不能是空字符串`)
                    );
                }
                return true;
            }
            return false;
        });

        if (alreadyExists) return;

        const insertionCode = `static ${ssidKeyName} = '${className}';\n`;

        const insertPos = classBody.start + 1;
        s.appendLeft(insertPos, insertionCode);
        modified = true;
    });

    if (modified) {
        const result = s.toString();
        return result;
    }

    return source;
};

module.exports = addStaticIdLoader;