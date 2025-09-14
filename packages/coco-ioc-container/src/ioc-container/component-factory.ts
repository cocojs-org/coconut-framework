import IocComponentDefinition, {
  type ComponentFieldPostConstruct,
  type ComponentMethodPostConstruct,
  ComponentPostConstruct,
  clsDefinitionMap,
  idDefinitionMap,
  type Id,
  getDefinition,
  existDefinition,
} from './ioc-component-definition';
import Component, { Scope } from '../decorator/metadata/component';
import {
  findClassMetadata,
  listClassMetadata,
  listFieldByMetadataCls,
  listFieldMetadata,
  listMethodMetadata,
} from '../metadata';
import type Application from './application';
import { KindClass, KindField, KindMethod } from './decorator-context';
import ConstructorParam from '../decorator/metadata/constructor-param';
import Autowired from '../decorator/metadata/autowired';
import { createDiagnose, DiagnoseCode, stringifyDiagnose } from 'shared';
import Qualifier from '../decorator/metadata/qualifier';

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

function newInstance<T>(
  application: Application,
  ClsOrId: Class<T> | Id,
  rest: { qualifier?: string; constructorArgs?: any[] } = {}
): T {
  const { qualifier, constructorArgs = [] } = rest;
  const definition = getDefinition(ClsOrId, application, qualifier);
  if (!definition) {
    const diagnose = createDiagnose(
      DiagnoseCode.CO10011,
      typeof ClsOrId === 'string' ? ClsOrId : ClsOrId.name
    );
    throw new Error(stringifyDiagnose(diagnose));
  }
  const cls = definition.cls;
  const metadata = findClassMetadata(cls, Component, 2);
  const isSingleton = metadata.scope === Scope.Singleton;
  if (isSingleton && singletonInstances.has(cls)) {
    return singletonInstances.get(cls);
  }
  // TODO: 还需要处理通过@component装饰方法注入的类
  const component = createComponent(
    application,
    definition,
    ...constructorArgs
  );
  if (isSingleton) {
    singletonInstances.set(cls, component);
  }
  return component;
}

type ConstructOption = {
  cls: Class<any>;
  option?: { constructorParams?: any[]; qualifier?: string };
};
function getComponents(
  application: Application,
  constructOption: ConstructOption
) {
  const instances = new Map<Class<any>, any>();
  const instantiatingStage = new Set<Class<any>>(); // 实例化中
  const assignningStage = new Set<Class<any>>(); // field赋值中
  const finishedStage = new Set<Class<any>>(); // 已完成

  // 已经有的单例填充到finishedStage和instances
  for (const cls of singletonInstances.keys()) {
    finishedStage.add(cls);
    instances.set(cls, singletonInstances.get(cls));
  }

  // 完整的初始化一个组件
  function instantiateComponent(opt: ConstructOption) {
    const { cls } = opt;
    if (!existDefinition(cls)) {
      const diagnose = createDiagnose(DiagnoseCode.CO10011, cls.name);
      throw new Error(stringifyDiagnose(diagnose));
    }
    if (instantiatingStage.has(cls)) {
      // 理论上不可能走到这里
      throw new Error(`循环依赖: ${cls.name}`);
    }
    // 已实例化，直接返回
    if (assignningStage.has(cls) || finishedStage.has(cls)) {
      return instances.get(cls);
    }
    instantiatingStage.add(cls);

    const constructorArgs = [];
    const constructorParams = listClassMetadata(cls, ConstructorParam);
    if (constructorParams.length > 0) {
      // 因为元数据不能重复，所以只有一个
      const constructorParamsParams = (constructorParams[0] as ConstructorParam)
        .value;
      for (const dependency of constructorParamsParams) {
        if (dependency === undefined) {
          constructorArgs.push(undefined);
        } else {
          const depInstance = instantiateComponent({ cls: dependency });
          // 确保依赖已完全注入
          if (!finishedStage.has(dependency)) {
            throw new Error(
              `${cls.name} 的构造函数依赖 ${dependency.name} 未完全注入`
            );
          }
          constructorArgs.push(depInstance);
        }
      }
    }

    // 2. 实例化，同时执行componentPostConstruct
    const instance = newInstance(application, cls, {
      constructorArgs,
      qualifier: opt.option?.qualifier,
    });
    instances.set(cls, instance);
    instantiatingStage.delete(cls);
    assignningStage.add(cls);

    // 3. 递归实例化field注入
    const autowiredFields = listFieldByMetadataCls(cls, Autowired);
    for (const field of autowiredFields) {
      const autowiredMetadatas = listFieldMetadata(
        cls,
        field,
        Autowired
      ) as Autowired[];
      if (autowiredMetadatas.length > 0) {
        const autowiredCls = autowiredMetadatas[0].value;
        if (autowiredCls === undefined) {
          instance[field] = undefined;
        } else if (autowiredCls === cls) {
          // 检查自依赖：不能注入自己
          instance[field] = undefined;
        } else {
          const qualifierMetadatas = listFieldMetadata(
            cls,
            field,
            Qualifier
          ) as Qualifier[];
          let qualifier: string;
          if (qualifierMetadatas.length > 0) {
            qualifier = qualifierMetadatas[0].value;
          }
          const autowiredInstance = instantiateComponent({
            cls: autowiredCls,
            option: { qualifier },
          });
          // 字段注入只需要依赖已实例化
          if (
            !assignningStage.has(autowiredCls) &&
            !finishedStage.has(autowiredCls)
          ) {
            const diagnose = createDiagnose(
              DiagnoseCode.CO10012,
              cls.name,
              field
            );
            throw new Error(stringifyDiagnose(diagnose));
          }
          instance[field] = autowiredInstance;
        }
      }
    }

    // 4. 标记为完全注入
    assignningStage.delete(cls);
    finishedStage.add(cls);

    return instance;
  }

  // TODO: 如果初始化多个，有没有先后顺序问题？
  const instance = instantiateComponent(constructOption);
  return instance;
}

function clear() {
  idDefinitionMap.clear();
  clsDefinitionMap.clear();
  singletonInstances.clear();
}

export { getComponents, findInstantiateComponent, addPostConstruct, clear };
