import * as ts from 'typescript';
import { hasClassKindDecorator, updateTypeImports } from './util.ts';
import { updateConstructorParamDecorator } from './constructor-param-decorator.ts';
import { updateAutowiredDecorator } from './autowired-decorator.ts';
import { updateComponentDecorator } from './component-decorator.ts';
import { ifNeedAdd$$idProperty } from './static-$$id-property.ts';

function updateMembers(classDeclaration: ts.ClassDeclaration) {
    let updated = false;
    let autowiredList: ts.Identifier[] = [];
    let componentList: ts.Identifier[] = [];
    const updateAutowired = (identifier: ts.Identifier) => {
        autowiredList.push(identifier);
        updated = true;
    };
    const updateComponent = (identifier: ts.Identifier) => {
        componentList.push(identifier);
        updated = true;
    };
    const members = classDeclaration.members.map((member) => {
        if (ts.isPropertyDeclaration(member)) {
            return updateAutowiredDecorator(member, updateAutowired);
        } else if (ts.isMethodDeclaration(member)) {
            return updateComponentDecorator(member, updateComponent);
        } else {
            return member;
        }
    });

    return { updated, members: updated ? members : classDeclaration.members, autowiredList, componentList };
}

function transformerFactory(prefix: string = ''): ts.TransformerFactory<ts.SourceFile> {
    return (context): (s: ts.SourceFile) => ts.SourceFile => {
        let constructorParamList: ts.Identifier[] = [];
        let autowiredList: ts.Identifier[] = [];
        let componentList: ts.Identifier[] = [];
        const visit: ts.Visitor = (node) => {
            if (ts.isClassDeclaration(node)) {
                if (hasClassKindDecorator(node)) {
                    const $$idProperty = ifNeedAdd$$idProperty(node, prefix);
                    const { members, updated: membersUpdated, autowiredList: _autowiredList, componentList: _componentList } = updateMembers(node);
                    const {
                        modifiers,
                        updated: constructorParamsUpdated,
                        constructorParamTypeList: _constructorParamTypeList,
                    } = updateConstructorParamDecorator(node);

                    if (!membersUpdated && !constructorParamsUpdated && !$$idProperty) {
                        return node;
                    } else {
                        if (_autowiredList) { autowiredList = _autowiredList; }
                        if (_componentList) { componentList = _componentList; }
                        if (constructorParamsUpdated) {constructorParamList = _constructorParamTypeList;}
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

            if (!constructorParamList.length && !autowiredList.length && !componentList.length) {
                return updatedSourceFile;
            }

            return updateTypeImports(updatedSourceFile, [ ...constructorParamList, ...autowiredList, ...componentList]);
        };
    };
}

export default transformerFactory
