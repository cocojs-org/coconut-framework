import {
  type Field,
  KindClass,
  KindField,
  KindMethod,
} from './decorator-context';
import type Application from './application';
import type Metadata from '../metadata/metadata';
import { isDescendantOf, uppercaseFirstLetter } from '../share/util';
import { createDiagnose, DiagnoseCode, stringifyDiagnose } from 'shared';

/**
 * @public
 * @param metadata - 元数据实例对象
 * @param application - 全局的application对象
 */
export type ComponentClassPostConstructFn = (
  metadata: Metadata,
  application: Application
) => void;
/**
 * @public
 * @param metadata - 元数据实例对象
 * @param application - 全局的application对象
 * @param field - 被装饰的字段名
 */
export type ComponentFieldPostConstructFn = (
  metadata: Metadata,
  application: Application,
  field: Field
) => void;
/**
 * @public
 */
export type ComponentMethodPostConstructFn = (
  metadata: Metadata,
  application: Application,
  field: Field
) => void;
/**
 * @public
 */
export type ComponentPostConstructFn =
  | ComponentClassPostConstructFn
  | ComponentFieldPostConstructFn
  | ComponentMethodPostConstructFn;

export interface ComponentClassPostConstruct {
  kind: typeof KindClass;
  metadataCls: Class<any>;
  fn: ComponentClassPostConstructFn;
}

export interface ComponentFieldPostConstruct {
  kind: typeof KindField;
  metadataCls: Class<any>;
  fn: ComponentFieldPostConstructFn;
  field: Field;
}

export interface ComponentMethodPostConstruct {
  kind: typeof KindMethod;
  metadataCls: Class<any>;
  fn: ComponentMethodPostConstructFn;
  field: Field;
}

export type ComponentPostConstruct =
  | ComponentClassPostConstruct
  | ComponentFieldPostConstruct
  | ComponentMethodPostConstruct;

/**
 * 所有被扫描的规范的组件
 * 包括：
 * 1. 项目中添加@component类装饰的组件
 * 2. 第三方添加@component类装饰的组件
 * 3. 项目中通过@component方法装饰注册的组件
 */
export interface IocComponentDefinition<T> {
  // 组件id，每个组件的id是唯一的
  id: string;

  cls: Class<T>;

  // 是否是单例模式，否则每次实例化都会创建一个新的实例
  isSingleton: boolean;

  // 实例化方式
  instantiateType: 'new' | 'method';

  /**
   * 元数据的定义后置处理方法
   * new表达式后立刻执行
   */
  componentPostConstruct?: ComponentPostConstruct[];

  // 当实例化方式为method时对应的选项
  methodInstantiateOpts?: {
    configurationCls: Class<any>; // 配置类
    method: string; // 方法名
  };
}

function newIocComponentDefinition<T>(
  id: string,
  cls: Class<T>,
  isSingleton: boolean,
  instantiateType: 'new' | 'method'
): IocComponentDefinition<T> {
  return { id, cls, isSingleton, instantiateType, componentPostConstruct: [] };
}

function genClassPostConstruct(
  metadataCls: Class<any>,
  fn: ComponentClassPostConstructFn
): ComponentClassPostConstruct {
  return { kind: KindClass, metadataCls, fn };
}

function genFieldPostConstruct(
  metadataCls: Class<any>,
  fn: ComponentFieldPostConstructFn,
  field: Field
): ComponentFieldPostConstruct {
  return { kind: KindField, metadataCls, fn, field };
}

function genMethodPostConstruct(
  metadataCls: Class<any>,
  fn: ComponentMethodPostConstructFn,
  field: Field
): ComponentMethodPostConstruct {
  return { kind: KindMethod, metadataCls, fn, field };
}

type Id = string;
const idDefinitionMap: Map<Id, IocComponentDefinition<any>> = new Map();
const clsDefinitionMap: Map<
  Class<any>,
  IocComponentDefinition<any>
> = new Map();

function addDefinition(
  cls: Class<any>,
  isSingleton: boolean,
  methodInstantiateOpts?: { configurationCls: Class<any>; method: string }
) {
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
  const componentDefinition = newIocComponentDefinition(
    id,
    cls,
    isSingleton,
    methodInstantiateOpts ? 'method' : 'new'
  );
  if (methodInstantiateOpts) {
    componentDefinition.methodInstantiateOpts = methodInstantiateOpts;
  }
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

/**
 * 获取真正会实例化的类定义
 * @param ClsOrId 想要实例化的类或类id
 * @param qualifier 如果存在多个后端类，需要通过qualifier指定具体的类id
 * @returns 真正会实例化的类定义
 */
function getInstantiateDefinition(
  ClsOrId: Class<any> | Id,
  qualifier?: string
) {
  const definition = getDefinition(ClsOrId);
  if (!definition) {
    const diagnose = createDiagnose(
      DiagnoseCode.CO10011,
      typeof ClsOrId === 'string' ? ClsOrId : ClsOrId.name
    );
    throw new Error(stringifyDiagnose(diagnose));
  }
  const descendantList: Class<any>[] = Array.from(
    clsDefinitionMap.keys()
  ).filter((i) => isDescendantOf(i, definition.cls));
  if (descendantList.length === 0) {
    // 没有子组件直接返回本身
    return definition;
  } else if (descendantList.length === 1) {
    // 有一个子组件
    return clsDefinitionMap.get(descendantList[0]);
  } else {
    // 多个子组件
    if (qualifier) {
      for (const child of descendantList) {
        const def = clsDefinitionMap.get(child);
        if (def.id === qualifier) {
          return def;
        }
      }
    }
    if (qualifier) {
      const diagnose = createDiagnose(
        DiagnoseCode.CO10010,
        definition.id,
        descendantList.map((i) => i.name),
        qualifier
      );
      throw new Error(stringifyDiagnose(diagnose));
    } else {
      const diagnose = createDiagnose(
        DiagnoseCode.CO10009,
        definition.id,
        descendantList.map((i) => i.name)
      );
      throw new Error(stringifyDiagnose(diagnose));
    }
  }
}

function getDefinition(ClsOrId: Class<any> | Id) {
  if (typeof ClsOrId === 'string') {
    return idDefinitionMap.get(ClsOrId);
  } else {
    return clsDefinitionMap.get(ClsOrId);
  }
}

function existDefinition(ClsOrId: Class<any> | Id) {
  if (typeof ClsOrId === 'string') {
    return idDefinitionMap.has(ClsOrId);
  } else {
    return clsDefinitionMap.has(ClsOrId);
  }
}

function clear() {
  idDefinitionMap.clear();
  clsDefinitionMap.clear();
}

export {
  type Id,
  clear,
  existDefinition,
  getInstantiateDefinition,
  getDefinition,
  addDefinition,
  addPostConstruct,
  genClassPostConstruct,
  genFieldPostConstruct,
  genMethodPostConstruct,
};
