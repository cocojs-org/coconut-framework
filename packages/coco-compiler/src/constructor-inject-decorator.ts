// 处理@constructorInject装饰器相关逻辑


import * as ts from 'typescript';
import { extractIdentifierFromType, hasClassKindDecorator, isDecoratorExp } from './util.ts';

function isConstructParamsDecorator(decorator: ts.Decorator): boolean {
    return isDecoratorExp(decorator, 'constructorInject');
}

function extractIdentifiersFromConstructor(ctor: ts.ConstructorDeclaration): ts.Identifier[] {
    const identifiers: ts.Identifier[] = [];

    for (const param of ctor.parameters) {
        if (!param.type) {
            return [];
        }

        const id = extractIdentifierFromType(param.type);
        if (!id) {
            return [];
        }

        identifiers.push(id);
    }

    return identifiers;
}

function updateConstructorInjectDecorator(classDeclaration: ts.ClassDeclaration) {
    const modifiers = classDeclaration.modifiers;
    if (!modifiers) {
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    const decorators = modifiers.filter(ts.isDecorator);
    if (!decorators.length) {
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    const constructParams = decorators.find(isConstructParamsDecorator);
    if (constructParams) {
        // 用户自定义，不处理
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    // 找 constructor
    const ctor = classDeclaration.members.find((m): m is ts.ConstructorDeclaration => ts.isConstructorDeclaration(m));

    if (!ctor) {
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    const identifiers = extractIdentifiersFromConstructor(ctor);
    if (!identifiers.length) {
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    const constructorInjectDecorator = ts.factory.createDecorator(
        ts.factory.createCallExpression(
            ts.factory.createIdentifier('constructorInject'),
            undefined,
            [ts.factory.createArrayLiteralExpression(identifiers, false)]
        )
    );
    const newModifiers = [...modifiers, constructorInjectDecorator];

    return { updated: true, modifiers: newModifiers, constructorInjectTypeList: identifiers };
}

export { updateConstructorInjectDecorator };

