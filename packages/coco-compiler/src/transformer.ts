import * as ts from 'typescript';
import { hasClassKindDecorator, updateTypeImports } from './util.ts';
import { updateConstructorParamDecorator } from './constructor-param-decorator.ts';
import { updateAutowiredDecorator } from './autowired-decorator.ts';
import { updateComponentDecorator } from './component-decorator.ts';
import { ifNeedAdd$$idProperty } from './static-$$id-property.ts';

function updateMembers(classDeclaration: ts.ClassDeclaration) {
    let updated = false;
    const markUpdate = () => { updated = true; };
    const members = classDeclaration.members.map((member) => {
        if (ts.isPropertyDeclaration(member)) {
            return updateAutowiredDecorator(member, markUpdate);
        } else if (ts.isMethodDeclaration(member)) {
            return updateComponentDecorator(member, markUpdate);
        } else {
            return member;
        }
    });

    return { updated, members: updated ? members : classDeclaration.members };
}

function transformerFactory(prefix: string = ''): ts.TransformerFactory<ts.SourceFile> {
    return (context): (s: ts.SourceFile) => ts.SourceFile => {
        let constructorParamTypeList: ts.Identifier[];
        const visit: ts.Visitor = (node) => {
            if (ts.isClassDeclaration(node)) {
                if (hasClassKindDecorator(node)) {
                    const $$idProperty = ifNeedAdd$$idProperty(node, prefix);
                    const { members, updated: membersUpdated } = updateMembers(node);
                    const {
                        modifiers,
                        updated: constructorParamsUpdated,
                        constructorParamTypeList: _constructorParamTypeList,
                    } = updateConstructorParamDecorator(node);

                    if (!membersUpdated && !constructorParamsUpdated && !$$idProperty) {
                        return node;
                    } else {
                        if (constructorParamsUpdated) {
                            constructorParamTypeList = _constructorParamTypeList;
                        }
                        return ts.factory.updateClassDeclaration(
                            node,
                            modifiers,
                            node.name,
                            node.typeParameters,
                            node.heritageClauses,
                            $$idProperty ? [$$idProperty, ...members] : members
                        );
                    }
                }
                return node;
            } else {
                return ts.visitEachChild(node, visit, context);
            }
        };

        // @ts-ignore
        return (sourceFile) => {
            const updatedSourceFile = ts.visitNode(sourceFile, visit) as ts.SourceFile;

            if (!constructorParamTypeList?.length) {
                return updatedSourceFile;
            }

            // TODO: @autowired和@component应该也要导入的。
            return updateTypeImports(updatedSourceFile, constructorParamTypeList);
        };
    };
}

export default transformerFactory
