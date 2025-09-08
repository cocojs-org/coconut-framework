import IocComponentDefinition, {
  type ComponentFieldPostConstruct,
  type ComponentMethodPostConstruct,
  ComponentPostConstruct,
  clsDefinitionMap,
  idDefinitionMap,
  type Id,
  getDefinition,
} from './ioc-component-definition';
import Component, { Scope } from '../decorator/metadata/component';
import {
  findClassMetadata,
  listClassMetadata,
  listFieldMetadata,
  listMethodMetadata,
} from '../metadata';
import type Application from './application';
import { KindClass, KindField, KindMethod } from './decorator-context';

function addPostConstruct(cls: Class<any>, pc: ComponentPostConstruct) {
  const definition = clsDefinitionMap.get(cls);
  if (!definition) {
    if (__TEST__) {
      throw new Error('没有对应的cls');
    }
  }
  switch (pc.kind) {
    case KindClass:
      if (
        definition.componentPostConstruct.find(
          (i) => i.metadataCls === pc.metadataCls
        )
      ) {
        if (__TEST__) {
          throw new Error('一个类装饰器只能有一个对应的postConstruct');
        }
      }
      break;
    case KindField: {
      const pcs =
        definition.componentPostConstruct as ComponentFieldPostConstruct[];
      const fieldPc = pc as ComponentFieldPostConstruct;
      if (
        pcs.find(
          (i) =>
            i.metadataCls === fieldPc.metadataCls && i.field === fieldPc.field
        )
      ) {
        if (__TEST__) {
          throw new Error('重复的postConstruct');
        }
      }
      break;
    }
    case KindMethod: {
      const pcs =
        definition.componentPostConstruct as ComponentMethodPostConstruct[];
      const fieldPc = pc as ComponentMethodPostConstruct;
      if (
        pcs.find(
          (i) =>
            i.metadataCls === fieldPc.metadataCls && i.field === fieldPc.field
        )
      ) {
        if (__TEST__) {
          throw new Error('重复的postConstruct');
        }
      }
      break;
    }
  }
  definition.componentPostConstruct.push(pc);
}

// 单例实例集合
const singletonInstances: Map<Class<any>, any> = new Map();

/*
 * 如果实例化组件ID，找到要实例化的子组件，也有可能是多子组件的情况下
 */
function findInstantiateComponent(
  application: Application,
  clsOrId: Class<any> | Id,
  qualifier?: string
) {
  const definition =
    typeof clsOrId === 'string'
      ? idDefinitionMap.get(clsOrId)
      : clsDefinitionMap.get(clsOrId);
  if (definition) {
    const definitionOrChildDefinition = getDefinition(
      definition.cls,
      application,
      qualifier
    );
    if (definitionOrChildDefinition) {
      return definitionOrChildDefinition.cls;
    } else {
      return definition.cls;
    }
  } else {
    throw new Error(`这应该是一个bug，没有${clsOrId}对应的组件`);
  }
}

function createComponent(
  application: Application,
  componentDefinition: IocComponentDefinition<any>,
  ...parameters: any[]
) {
  const cls = componentDefinition.cls;
  const component = new cls(...parameters);
  for (const cpc of componentDefinition.componentPostConstruct) {
    switch (cpc.kind) {
      case KindClass: {
        const metadata = listClassMetadata(cls, cpc.metadataCls);
        if (metadata.length === 1) {
          cpc.fn.call(component, metadata[0], application);
        } else {
          if (__TEST__) {
            console.error('元数据应该只有一个', cls, cpc.metadataCls);
          }
        }
        break;
      }
      case KindField: {
        const metadata = listFieldMetadata(cls, cpc.field, cpc.metadataCls);
        if (metadata.length === 1) {
          cpc.fn.call(component, metadata[0], application, cpc.field);
        } else {
          if (__TEST__) {
            console.error(
              '元数据应该只有一个',
              cls,
              cpc.metadataCls,
              cpc.field
            );
          }
        }
        break;
      }
      case KindMethod: {
        const metadata = listMethodMetadata(cls, cpc.field, cpc.metadataCls);
        if (metadata.length === 1) {
          cpc.fn.call(component, metadata[0], application, cpc.field);
        } else {
          if (__TEST__) {
            console.error(
              '元数据应该只有一个',
              cls,
              cpc.metadataCls,
              cpc.field
            );
          }
        }
        break;
      }
    }
  }
  return component;
}

/**
 * 创建一个ioc组件实例
 * @param application 应用实例；
 * @param ClsOrId 通过类定义或Id获取；
 * @param rest 其他参数
 */
function getComponent<T>(
  application: Application,
  ClsOrId: Class<T> | Id,
  rest: { qualifier?: string; newParameters?: any[] } = {}
): T {
  const { qualifier, newParameters = [] } = rest;
  const definition = getDefinition(ClsOrId, application, qualifier);
  if (!definition) {
    if (__TEST__) {
      console.error('definition', clsDefinitionMap);
      throw new Error(`can no find component definition:${ClsOrId}`);
    }
  }
  const cls = definition.cls;
  const metadata = findClassMetadata(cls, Component, 2);
  const isSingleton = metadata.scope === Scope.Singleton;
  if (isSingleton && singletonInstances.has(cls)) {
    return singletonInstances.get(cls);
  }
  const component = createComponent(application, definition, ...newParameters);
  if (isSingleton) {
    singletonInstances.set(cls, component);
  }
  return component;
}

function clear() {
  idDefinitionMap.clear();
  clsDefinitionMap.clear();
  singletonInstances.clear();
}

export { getComponent, findInstantiateComponent, addPostConstruct, clear };
