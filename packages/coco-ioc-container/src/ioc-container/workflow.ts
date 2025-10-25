/**
 * ioc容器以及组件工作流
 */
import {
    buildComponentMetadataSet,
    clear as clearComponentMetadataSet,
    findComponentDecorator,
    findComponentDecoratorScope,
} from './ioc-component-definition-helper';
import { type ClassMetadata } from '../metadata';
import Scope, { SCOPE } from '../decorator/metadata/scope';
import Component from '../decorator/metadata/component';
import { addDefinition, clear as clearIocComponentDefinition } from './ioc-component-definition';
import { clear as clearComponentFactory } from './component-factory';

function doBuildIocComponentDefinition(classMetadata: ClassMetadata) {
    const [_, bizMetadata] = classMetadata.getAll();
    for (const beDecoratedCls of bizMetadata.keys()) {
        if (bizMetadata.has(beDecoratedCls)) {
            const componentMetadata = findComponentDecorator(beDecoratedCls, bizMetadata);
            if (componentMetadata) {
                // 确定存在component类装饰器，再确定scope值
                let scope: SCOPE;
                const selfScopeMetadata = classMetadata.listClassKindMetadata(beDecoratedCls, Scope) as Scope[];
                if (selfScopeMetadata.length > 0) {
                    scope = selfScopeMetadata[0].value;
                } else {
                    scope = findComponentDecoratorScope(componentMetadata);
                }
                addDefinition(beDecoratedCls, scope === SCOPE.Singleton);
            } else {
                const methods = classMetadata.listMethodByMetadataCls(beDecoratedCls, Component);
                for (const method of methods) {
                    const componentMetas: Component[] = classMetadata.listMethodKindMetadata(
                        beDecoratedCls,
                        method,
                        Component
                    ) as Component[];
                    const scopeMetas: Scope[] = classMetadata.listMethodKindMetadata(
                        beDecoratedCls,
                        method,
                        Scope
                    ) as Scope[];
                    addDefinition(
                        componentMetas[0].value,
                        !scopeMetas.length || scopeMetas[0].value === SCOPE.Singleton,
                        {
                            configurationCls: beDecoratedCls,
                            method,
                        }
                    );
                }
            }
        }
    }
}

/**
 * 找到所有类组件，添加到iocComponentDefinition中，便于后续实例化
 * 遍历所有的业务类，如果有类装饰器，那么就是类组件
 * 遍历所有配置类的方法，如果有@component装饰器，那么也是类组件
 */
function initIocComponentDefinitionModule(classMetadata: ClassMetadata) {
    buildComponentMetadataSet(classMetadata);

    doBuildIocComponentDefinition(classMetadata);

    clearComponentMetadataSet();
}

function clearIocComponentDefinitionModule() {
    clearComponentFactory();
    clearIocComponentDefinition();
}

export { initIocComponentDefinitionModule, clearIocComponentDefinitionModule };
