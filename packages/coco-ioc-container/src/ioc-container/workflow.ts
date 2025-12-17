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
import Id from '../decorator/metadata/id';
import Component from '../decorator/metadata/component';
import IocComponentDefinition from './ioc-component-definition';
import IocComponentFactory from './ioc-component-factory';

function doBuildIocComponentDefinition(
    metadataRepository: MetadataRepository,
    componentMetadataClass: ComponentMetadataClass,
    iocComponentDefinition: IocComponentDefinition
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
                iocComponentDefinition.addDefinition(beDecoratedCls, beDecoratedCls.$$id, scope === SCOPE.Singleton);
            } else {
                const methods = metadataRepository.listMethodByMetadataCls(beDecoratedCls, Component);
                for (const method of methods) {
                    const componentMetas: Component[] = metadataRepository.listMethodKindMetadata(
                        beDecoratedCls,
                        method,
                        Component
                    ) as Component[];
                    // TODO: @component()装饰器的参数能否在 ioc 组件中定义了，没有定义都是有问题的
                    const scopeMetas: Scope[] = metadataRepository.listMethodKindMetadata(
                        beDecoratedCls,
                        method,
                        Scope
                    ) as Scope[];
                    // TODO: 添加校验是否有@cocoid装饰器；
                    const cocoidMetas: Id[] = metadataRepository.listMethodKindMetadata(
                        beDecoratedCls,
                        method,
                        Id
                    ) as Id[];
                    iocComponentDefinition.addDefinition(
                        componentMetas[0].value,
                        cocoidMetas[0].value,
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
function initIocComponentModule(
    metadataRepository: MetadataRepository,
    componentMetadataClass: ComponentMetadataClass
) {
    const iocComponentDefinition = new IocComponentDefinition();

    doBuildIocComponentDefinition(metadataRepository, componentMetadataClass, iocComponentDefinition);
    helperClear();

    return {
        iocComponentDefinition,
        iocComponentFactory: new IocComponentFactory(),
    };
}

function destructorIocComponentModule(
    iocComponentDefinition: IocComponentDefinition,
    iocComponentFactory: IocComponentFactory
) {
    if (__TEST__) {
        iocComponentFactory?.destructor();
        iocComponentDefinition?.destructor();
    } else {
        iocComponentFactory.destructor();
        iocComponentDefinition.destructor();
    }
}

export { initIocComponentModule, destructorIocComponentModule };
