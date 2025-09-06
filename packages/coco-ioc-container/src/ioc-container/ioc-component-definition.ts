import {
  type Field,
  KindClass,
  KindField,
  KindMethod,
} from './decorator-context';
import {
  listClassMetadata,
  listFieldMetadata,
  listMethodMetadata,
} from '../metadata';
import type Application from './application';
import type Metadata from '../metadata/metadata';

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

export function genClassPostConstruct(
  metadataCls: Class<any>,
  fn: ComponentClassPostConstructFn
): ComponentClassPostConstruct {
  return { kind: KindClass, metadataCls, fn };
}

export function genFieldPostConstruct(
  metadataCls: Class<any>,
  fn: ComponentFieldPostConstructFn,
  field: Field
): ComponentFieldPostConstruct {
  return { kind: KindField, metadataCls, fn, field };
}

export function genMethodPostConstruct(
  metadataCls: Class<any>,
  fn: ComponentMethodPostConstructFn,
  field: Field
): ComponentMethodPostConstruct {
  return { kind: KindMethod, metadataCls, fn, field };
}

export function createComponent(
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
