import * as ts from 'typescript';

const innerIdName = '$$id';

function ifNeedAdd$$idProperty(classDecorator: ts.ClassDeclaration, prefix: string) {
    const className = classDecorator.name.text;
    const $$idProperties = classDecorator.members.filter(
        (member) =>
            ts.isPropertyDeclaration(member) &&
            member.modifiers?.some((modify) => modify.kind === ts.SyntaxKind.StaticKeyword) &&
            ts.isIdentifier(member.name) &&
            member.name.text === '$$id'
    );

    if ($$idProperties.length === 0) {
        return ts.factory.createPropertyDeclaration(
            [ts.factory.createModifier(ts.SyntaxKind.StaticKeyword)],
            innerIdName,
            undefined,
            undefined,
            ts.factory.createStringLiteral(`${prefix}${className}`)
        );
    } else if ($$idProperties.length === 1) {
        const property: any = $$idProperties[0];
        if (property.initializer && ts.isStringLiteral(property.initializer)) {
            if (!property.initializer.text.trim()) {
                throw new Error(`想要为类${className}自定义"${innerIdName}"，值不能是空字符串`);
            } else {
                return null;
            }
        } else {
            throw new Error(`想要为类${className}自定义"${innerIdName}"，值必须是字符串字面量`);
        }
    } else {
        throw new Error(`类${className}存在多个"${innerIdName}"，最多只能有一个！`);
    }
}

export { ifNeedAdd$$idProperty }
