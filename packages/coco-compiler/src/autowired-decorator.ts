import * as ts from 'typescript';
import { extractIdentifierFromType, isDecoratorExp } from './util.ts';

function isAutowiredDecorator(decorator: ts.Decorator): decorator is ts.Decorator {
    return isDecoratorExp(decorator, 'autowired');
}

function updateAutowiredDecorator(member: ts.ClassElement, markUpdate: () => void) {
    if (!ts.isPropertyDeclaration(member)) {
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
    const autowired = decorators.find(isAutowiredDecorator);
    if (!autowired) {
        return member;
    }
    const call = autowired.expression as ts.CallExpression;

    // 已经有参数，不处理
    if (call.arguments.length > 0) {
        return member;
    }
    if (!member.type) {
        return member;
    }
    const identifier = extractIdentifierFromType(member.type);
    if (!identifier) {
        return member;
    }

    markUpdate();
    const newModifiers = modifiers.map((m) =>
        ts.isDecorator(m) && m === autowired
            ? ts.factory.createDecorator(
                  ts.factory.updateCallExpression(call, call.expression, call.typeArguments, [identifier])
              )
            : m
    );
    return ts.factory.updatePropertyDeclaration(
        member,
        newModifiers,
        member.name,
        ts.factory.createToken(ts.SyntaxKind.ExclamationToken),
        member.type,
        member.initializer
    );
}

export { updateAutowiredDecorator };
