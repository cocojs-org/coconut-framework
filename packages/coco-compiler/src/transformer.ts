import * as ts from 'typescript';
import { hasClassKindDecorator, updateTypeImports } from './util.ts';
import { updateConstructorInjectDecorator } from './constructor-inject-decorator.ts';
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

/**
 * 转换工具工厂函数
 * @param idPrefix id前缀
 * @param addConstructorInjectImportStmt 遇到构造函数有参数时，是否添加import { constructorInject } from 'xxx'语句
 */
function transformerFactory(
    idPrefix: string = '',
    addConstructorInjectImportStmt?: 'coco-ioc-container' | '@cocojs/mvc'
): ts.TransformerFactory<ts.SourceFile> {
    return (context): ((s: ts.SourceFile) => ts.SourceFile) => {
        let constructorInjectList: ts.Identifier[] = [];
        let autowiredList: ts.Identifier[] = [];
        let componentList: ts.Identifier[] = [];
        const visit: ts.Visitor = (node) => {
            if (ts.isClassDeclaration(node)) {
                if (hasClassKindDecorator(node)) {
                    const $$idProperty = ifNeedAdd$$idProperty(node, idPrefix);
                    const {
                        members,
                        updated: membersUpdated,
                        autowiredList: _autowiredList,
                        componentList: _componentList,
                    } = updateMembers(node);
                    const {
                        modifiers,
                        updated: constructorInjectUpdated,
                        constructorInjectTypeList: _constructorInjectTypeList,
                    } = updateConstructorInjectDecorator(node);

                    if (!membersUpdated && !constructorInjectUpdated && !$$idProperty) {
                        return node;
                    } else {
                        if (_autowiredList) {
                            autowiredList = _autowiredList;
                        }
                        if (_componentList) {
                            componentList = _componentList;
                        }
                        if (constructorInjectUpdated) {
                            constructorInjectList = _constructorInjectTypeList;
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

            if (!constructorInjectList.length && !autowiredList.length && !componentList.length) {
                return updatedSourceFile;
            }

            let importConstructorInjectDecorator: undefined | { module: string };
            if (!!constructorInjectList.length && addConstructorInjectImportStmt) {
                if (
                    addConstructorInjectImportStmt === 'coco-ioc-container' ||
                    addConstructorInjectImportStmt === '@cocojs/mvc'
                ) {
                    importConstructorInjectDecorator = { module: addConstructorInjectImportStmt };
                } else {
                    console.error('未知的addConstructorInjectImportStmt', addConstructorInjectImportStmt);
                }
            }

            return updateTypeImports(
                updatedSourceFile,
                [...constructorInjectList, ...autowiredList, ...componentList],
                importConstructorInjectDecorator
            );
        };
    };
}

export default transformerFactory
