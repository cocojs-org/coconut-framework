/**
 * 所有组件元数据的信息，便于初始化ioc-component-definition
 */
import Metadata from '../metadata/instantiate-one-metadata';
import Component from '../decorator/metadata/component';
import Scope, { SCOPE } from '../decorator/metadata/scope';
import { type BizMetadata, type MetaMetadata } from '../metadata/index';
import { type ComponentMetadataClass } from '../metadata';

const scopeCache: Map<Metadata, SCOPE> = new Map();

function getComponentDecoratorScope(
    componentMetadata: Metadata,
    metaMetadataMap: Map<Class<Metadata>, MetaMetadata>,
    componentMetadataClass: ComponentMetadataClass
): SCOPE {
    if (scopeCache.has(componentMetadata)) {
        return scopeCache.get(componentMetadata);
    }
    const classMetadata = metaMetadataMap.get(componentMetadata.constructor as Class<any>)?.classMetadata;
    const scope = classMetadata.find((i) => i.constructor === Scope) as Scope;
    if (scope) {
        // 如果有@scope装饰器
        scopeCache.set(componentMetadata, scope.value);
        return scope.value;
    }
    const parentComponentMetadata = classMetadata.find((metadata) =>
        componentMetadataClass.isComponentMetadata(metadata.constructor as Class<Metadata>)
    );
    if (parentComponentMetadata) {
        // 如果被另外一个组件装饰器装饰
        const scope = getComponentDecoratorScope(parentComponentMetadata, metaMetadataMap, componentMetadataClass);
        scopeCache.set(componentMetadata, scope);
        return scope;
    } else if (componentMetadata.constructor === Component) {
        // 只能是Component
        scopeCache.set(componentMetadata, SCOPE.Singleton);
        return SCOPE.Singleton;
    } else {
        throw new Error(`这是一个 bug，没能正确解析出scope的值: ${componentMetadata.constructor.name}`);
    }
}

function clear() {
    scopeCache.clear();
}

// 找到组件装饰器对应的元数据
function findComponentMetadata(bizMetadata: BizMetadata, componentMetadataClass: ComponentMetadataClass) {
    const { classMetadata } = bizMetadata;
    for (const metadata of classMetadata) {
        if (componentMetadataClass.isComponentMetadata(metadata.constructor as Class<any>)) {
            return metadata;
        }
    }
    return undefined;
}

export { clear, findComponentMetadata, getComponentDecoratorScope };
