import * as ts from 'typescript';
import { extractIdentifierFromType, hasClassKindDecorator, isDecoratorExp } from './util.ts';

function isComponentDecorator(decorator: ts.Decorator): boolean {
    return isDecoratorExp(decorator, 'component');
}

function updateComponentDecorator(member: ts.ClassElement, markUpdate: (identifier: ts.Identifier) => void) {
    if (!ts.isMethodDeclaration(member)) {
        return member;
    }

    const modifiers = member.modifiers;
    if (!modifiers) {
        return member;
    }

    const decorators = modifiers.filter(ts.isDecorator);
    if (!decorators.length) {
        return member;
    }

    const component = decorators.find(isComponentDecorator);
    if (!component) {
        return member;
    }

    const call = component.expression as ts.CallExpression;

    // 已有参数，不处理
    if (call.arguments.length > 0) {
        return member;
    }

    // 没有返回类型，无法补全
    if (!member.type) {
        return member;
    }

    const identifier = extractIdentifierFromType(member.type);
    if (!identifier) {
        return member;
    }

    markUpdate(identifier);
    const newModifiers = modifiers.map((m) =>
        ts.isDecorator(m) && m === component
            ? ts.factory.createDecorator(
                  ts.factory.updateCallExpression(call, call.expression, call.typeArguments, [identifier])
              )
            : m
    );
    return ts.factory.updateMethodDeclaration(
        member,
        newModifiers,
        member.asteriskToken,
        member.name,
        member.questionToken,
        member.typeParameters,
        member.parameters,
        member.type,
        member.body
    );
}

export { updateComponentDecorator}
