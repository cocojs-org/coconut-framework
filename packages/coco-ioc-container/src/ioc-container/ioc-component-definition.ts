import {
  type Field,
  KindClass,
  KindField,
  KindMethod,
} from './decorator-context';
import type Application from './application';
import type Metadata from '../metadata/metadata';
import { isChildClass, uppercaseFirstLetter } from '../share/util';
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

export default class IocComponentDefinition<T> {
  id: string;

  cls: Class<T>;

  /**
   * 自定义初始化方法
   * new表达式后立刻执行
   */
  componentPostConstruct?: ComponentPostConstruct[];
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

function getDefinition(
  ClsOrId: Class<any> | Id,
  application: Application,
  qualifier?: string
) {
  if (typeof ClsOrId === 'string') {
    // TODO: 如果使用id的话，要考虑子组件的情况吗？
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
    if (qualifier) {
      const diagnose = createDiagnose(
        DiagnoseCode.CO10010,
        ClsOrId.name,
        childCls.map((i) => i.name),
        qualifier
      );
      throw new Error(stringifyDiagnose(diagnose));
    } else {
      const diagnose = createDiagnose(
        DiagnoseCode.CO10009,
        ClsOrId.name,
        childCls.map((i) => i.name)
      );
      throw new Error(stringifyDiagnose(diagnose));
    }
  }
}

function existDefinition(ClsOrId: Class<any> | Id) {
  if (typeof ClsOrId === 'string') {
    return idDefinitionMap.has(ClsOrId);
  } else {
    return clsDefinitionMap.has(ClsOrId);
  }
}

export {
  type Id,
  clsDefinitionMap, // TODO: 不应该导出
  idDefinitionMap, // TODO: 不应该导出
  existDefinition,
  getDefinition,
  addDefinition,
  genClassPostConstruct,
  genFieldPostConstruct,
  genMethodPostConstruct,
};
