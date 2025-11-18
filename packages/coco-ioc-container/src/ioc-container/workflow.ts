/**
 * ioc容器以及组件工作流
 */
import {
    clear as helperClear,
    findComponentMetadata,
    getComponentDecoratorScope,
} from './ioc-component-definition-helper';
import { type ComponentMetadataClass, type MetadataRepository } from '../metadata';
import Scope, { SCOPE } from '../decorator/metadata/scope';
import Component from '../decorator/metadata/component';
import IocComponent from './ioc-component-definition';
import { clear as clearComponentFactory } from './component-factory';

function doBuildIocComponentDefinition(
    metadataRepository: MetadataRepository,
    componentMetadataClass: ComponentMetadataClass,
    iocComponent: IocComponent
) {
    const [metaMetadata, bizMetadata] = metadataRepository.getAll();
    for (const [beDecoratedCls, bizMeta] of bizMetadata.entries()) {
        if (bizMetadata.has(beDecoratedCls)) {
            const componentMetadata = findComponentMetadata(bizMeta, componentMetadataClass);
            if (componentMetadata) {
                let scope: SCOPE;
                const selfScopeMetadata = metadataRepository.listClassKindMetadata(beDecoratedCls, Scope) as Scope[];
                if (selfScopeMetadata.length > 0) {
                    // 优先取被装饰器类上的@scope装饰器
                    scope = selfScopeMetadata[0].value;
                } else {
                    // 取组件装饰器的@scope装饰器
                    scope = getComponentDecoratorScope(componentMetadata, metaMetadata, componentMetadataClass);
                }
                iocComponent.addDefinition(beDecoratedCls, scope === SCOPE.Singleton);
            } else {
                const methods = metadataRepository.listMethodByMetadataCls(beDecoratedCls, Component);
                for (const method of methods) {
                    const componentMetas: Component[] = metadataRepository.listMethodKindMetadata(
                        beDecoratedCls,
                        method,
                        Component
                    ) as Component[];
                    const scopeMetas: Scope[] = metadataRepository.listMethodKindMetadata(
                        beDecoratedCls,
                        method,
                        Scope
                    ) as Scope[];
                    iocComponent.addDefinition(
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
function initIocComponentDefinitionModule(
    metadataRepository: MetadataRepository,
    componentMetadataClass: ComponentMetadataClass
) {
    const iocComponent = new IocComponent();

    doBuildIocComponentDefinition(metadataRepository, componentMetadataClass, iocComponent);
    helperClear();

    return iocComponent;
}

function clearIocComponentDefinitionModule(iocComponent: IocComponent) {
    clearComponentFactory();
    if (__TEST__) {
        iocComponent?.destructor();
    } else {
        iocComponent.destructor();
    }
}

export { initIocComponentDefinitionModule, clearIocComponentDefinitionModule };
