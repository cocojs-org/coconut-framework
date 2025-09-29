/**
 * 所有组件元数据的信息，便于初始化ioc-component-definition
 */
import Metadata from './create-metadata';
import Component from '../decorator/metadata/component';
import Scope, { SCOPE } from '../decorator/metadata/scope';
import { getAllMetadata } from './index';

interface ScopeAndParentComponentMetadata {
  // 如果类组件上添加@scope装饰器，对应的scope实例
  scope?: Scope;
  // 添加的类装饰器的对应的元数据类，只有Component的此值是null，其他组件装饰器的此值都不为null
  compositeComponentMetadataCls: Class<any> | null;
}

// 所有的组件装饰器对应的元数据类组成的树，使用map表示
const componentMetadataTree: Map<
  Class<Metadata>,
  ScopeAndParentComponentMetadata
> = new Map();

/**
 * 初始化组件装饰器对应的元数据类的集合
 * 遍历元数据类map，如果满足以下3种情况：
 * 1. @component对应的元数据类，即：Component
 * 2. 一级复合的组件装饰对应的元数据类，类装饰器中包含了@component装饰器
 * 例如@view装饰器的元数据类是View
 * @component()
 * class View {}
 * 3. 二级复合的组件装饰对应的元数据类，类装饰器中包含了一级复合装饰器
 * 例如@page装饰器的元数据类是Page
 * @view()
 * class Page {}
 */
function buildComponentMetadataSet() {
  // 找到当前被装饰器上面的scope元数据
  function getScope(beDecoratedCls: Class<any>) {
    const [metaMetadataMap] = getAllMetadata();
    const classMetadata = metaMetadataMap.get(beDecoratedCls)?.classMetadata;
    if (classMetadata) {
      return classMetadata.find((i) => i.constructor === Scope) as Scope;
    }
    return undefined;
  }

  const [metaMetadataMap] = getAllMetadata();
  // 首先添加Component类
  componentMetadataTree.set(Component, {
    scope: getScope(Component),
    compositeComponentMetadataCls: null,
  });
  // 一级复合的组件装饰器
  const firstClassSet = new Set();
  for (const [beDecoratedCls, { classMetadata }] of metaMetadataMap.entries()) {
    const metadata: any = classMetadata.find(
      (i) => i.constructor === Component
    );
    if (metadata) {
      componentMetadataTree.set(beDecoratedCls, {
        scope: getScope(beDecoratedCls),
        compositeComponentMetadataCls: Component,
      });
      firstClassSet.add(beDecoratedCls);
    }
  }
  // 二级复合组件装饰器
  for (const [beDecoratedCls, { classMetadata }] of metaMetadataMap.entries()) {
    if (firstClassSet.has(beDecoratedCls)) {
      continue;
    }
    let firstClass = null;
    const metadata: any = classMetadata.find((i) => {
      if (firstClassSet.has(i.constructor)) {
        firstClass = i.constructor;
        return true;
      }
      return false;
    });
    if (metadata) {
      componentMetadataTree.set(beDecoratedCls, {
        scope: getScope(beDecoratedCls),
        compositeComponentMetadataCls: firstClass,
      });
    }
  }
}

/**
 * 指定一个类装饰器的scope的值
 * @param componentMetadata
 */
function findComponentDecoratorScope(componentMetadata: Metadata): SCOPE {
  let MetadataClass = componentMetadata.constructor as Class<Metadata>;
  while (MetadataClass) {
    const config = componentMetadataTree.get(MetadataClass);
    if (config === undefined) {
      throw new Error(`未知的装饰器元数据类：${MetadataClass.name}`);
    }
    const { scope, compositeComponentMetadataCls } = config;
    if (compositeComponentMetadataCls === null) {
      // Component情况
      return SCOPE.Singleton;
    } else if (scope) {
      // 有scope就取scope的值
      return scope.value;
    } else {
      // 继续找复合的装饰器
      MetadataClass = compositeComponentMetadataCls;
    }
  }
  throw new Error(`这应该是一个bug：${MetadataClass.name}`);
}

/**
 * 一个类的类装饰中是否包含组件装饰器
 * @param beDecoratedCls
 */
function findComponentDecorator(beDecoratedCls: Class<any>): Metadata | null {
  const [_, bizMetadataMap] = getAllMetadata();
  const bizMetadata = bizMetadataMap.get(beDecoratedCls);
  if (bizMetadata) {
    return bizMetadata.classMetadata.find((i) =>
      componentMetadataTree.has(i.constructor as Class<Metadata>)
    );
  }
  return null;
}

function clear() {
  componentMetadataTree.clear();
}

export {
  buildComponentMetadataSet,
  findComponentDecorator,
  findComponentDecoratorScope,
  clear,
};
