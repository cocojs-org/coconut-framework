// 处理@constructorParam装饰器相关逻辑


import * as ts from 'typescript';
import { extractIdentifierFromType, hasClassKindDecorator, isDecoratorExp } from './util.ts';

function isConstructParamsDecorator(decorator: ts.Decorator): boolean {
    return isDecoratorExp(decorator, 'constructorParam');
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

function updateConstructorParamDecorator(classDeclaration: ts.ClassDeclaration) {
    const modifiers = classDeclaration.modifiers;
    if (!modifiers) {
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    const decorators = modifiers.filter(ts.isDecorator);
    if (!decorators.length) {
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    const constructParams = decorators.find(isConstructParamsDecorator);
    if (!constructParams) {
        return { updated: false, modifiers: classDeclaration.modifiers };
    }

    const call = constructParams.expression as ts.CallExpression;

    // 已有参数，不处理
    if (call.arguments.length > 0) {
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

    // 构造数组：[Api, User]
    const arrayLiteral = ts.factory.createArrayLiteralExpression(identifiers, false);

    const newModifiers = modifiers.map((m) =>
        ts.isDecorator(m) && m === constructParams
            ? ts.factory.createDecorator(
                  ts.factory.updateCallExpression(call, call.expression, call.typeArguments, [arrayLiteral])
              )
            : m
    );

    return { updated: true, modifiers: newModifiers, constructorParamTypeList: identifiers };
}

export { updateConstructorParamDecorator };

