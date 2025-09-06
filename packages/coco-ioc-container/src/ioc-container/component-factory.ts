import IocComponentDefinition, {
  createComponent,
  type ComponentFieldPostConstruct,
  type ComponentMethodPostConstruct,
  ComponentPostConstruct,
} from './ioc-component-definition';
import Component, { Scope } from '../decorator/metadata/component';
import { findClassMetadata } from '../metadata';
import type Application from './application';
import { KindClass, KindField, KindMethod } from './decorator-context';
import { isChildClass, uppercaseFirstLetter } from '../share/util';

type Id = string;
const idDefinitionMap: Map<Id, IocComponentDefinition<any>> = new Map();
const clsDefinitionMap: Map<
  Class<any>,
  IocComponentDefinition<any>
> = new Map();

function addDefinition(cls: Class<any>) {
  const existClsDef = clsDefinitionMap.get(cls);
  if (existClsDef) {
    throw new Error(
      `存在同名的组件: [${existClsDef.cls.name}] - [${cls.name}]`
    );
  }
  const id = uppercaseFirstLetter(cls.name);
  if (typeof id !== 'string' || !id.trim()) {
    throw new Error(`生成组件id失败: [${cls.name}]`);
  }
  const existIdDef = idDefinitionMap.get(id);
  if (existIdDef) {
    throw new Error(`存在id的组件: [${existIdDef.cls.name}] - [${cls.name}]`);
  }
  const componentDefinition = new IocComponentDefinition();
  componentDefinition.id = id;
  componentDefinition.cls = cls;
  componentDefinition.componentPostConstruct = [];
  idDefinitionMap.set(id, componentDefinition);
  clsDefinitionMap.set(cls, componentDefinition);
}

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

function getDefinition(
  ClsOrId: Class<any> | Id,
  application: Application,
  qualifier?: string
) {
  if (typeof ClsOrId === 'string') {
    // todo 如果使用id的话，要考虑子组件的情况吗？
    return idDefinitionMap.get(ClsOrId);
  }
  const childCls: Class<any>[] = [];
  for (const beDecorated of clsDefinitionMap.keys()) {
    if (isChildClass(beDecorated, ClsOrId)) {
      childCls.push(beDecorated);
    }
  }
  const definition = clsDefinitionMap.get(ClsOrId);
  if (childCls.length === 0) {
    // 没有子组件直接返回本身
    return definition;
  } else if (childCls.length === 1) {
    // 有一个子组件
    return clsDefinitionMap.get(childCls[0]);
  } else {
    // 多个子组件
    let _qualifier = qualifier;
    if (!_qualifier && definition) {
      _qualifier = application.propertiesConfig.getValue(
        `${definition.id}.qualifier`
      );
    }
    if (_qualifier) {
      for (const child of childCls) {
        const def = clsDefinitionMap.get(child);
        if (def.id === _qualifier) {
          return def;
        }
      }
    }
    throw new Error(`不应该存在多个一样的子类组件${ClsOrId.name}`);
  }
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

export {
  getComponent,
  findInstantiateComponent,
  addDefinition,
  addPostConstruct,
  clear,
};
