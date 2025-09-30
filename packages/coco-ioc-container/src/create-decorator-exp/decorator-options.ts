/**
 * ioc组件的装饰器的componentPostConsturct，方便实例化ioc-component
 */
import type Metadata from '../metadata/create-metadata';
import type Application from '../ioc-container/application';
import { getId } from '../share/util';
import { Field } from './decorator-context';

/**
 * @public
 * @param metadata - 元数据实例对象
 * @param application - 全局的application对象
 */
type ComponentClassPostConstructFn = (
  metadata: Metadata,
  application: Application
) => void;
/**
 * @public
 * @param metadata - 元数据实例对象
 * @param application - 全局的application对象
 * @param field - 被装饰的字段名
 */
type ComponentFieldPostConstructFn = (
  metadata: Metadata,
  application: Application,
  field: Field
) => void;
/**
 * @public
 */
type ComponentMethodPostConstructFn = (
  metadata: Metadata,
  application: Application,
  field: Field
) => void;

type ComponentPostConstruct =
  | ComponentClassPostConstructFn
  | ComponentMethodPostConstructFn
  | ComponentFieldPostConstructFn;

interface CreateDecoratorExpOption {
  /**
   * 类实例化之后，会调用类的装饰器的componentPostConstruct做自定义的处理
   * @param metadata 装饰器参数实例化的元数据实例
   * @param application 全局application对象
   * @param field 被装饰的field名
   * @returns
   */
  componentPostConstruct?: ComponentPostConstruct;
}

const metadataDecoratorOptions: Map<
  Class<any>,
  CreateDecoratorExpOption
> = new Map();
const metadataIdDecoratorOptions: Map<string, CreateDecoratorExpOption> =
  new Map();

function setOption(
  metadataClass: Class<any> | string,
  options: CreateDecoratorExpOption = null
) {
  let id;
  if (typeof metadataClass === 'string') {
    id = metadataClass;
  } else {
    metadataDecoratorOptions.set(metadataClass, options);
    id = getId(metadataClass);
  }
  metadataIdDecoratorOptions.set(id, options);
}

// 针对一开始使用id添加选项的情况，补充元数据类
function addClassOptionById(metadataId: string, metadataClass: Class<any>) {
  const options = metadataIdDecoratorOptions.get(metadataId);
  if (options !== undefined) {
    metadataDecoratorOptions.set(metadataClass, options);
  }
}

function getOption(metadataClassOrId: Class<any> | string) {
  if (typeof metadataClassOrId === 'string') {
    return metadataIdDecoratorOptions.get(metadataClassOrId);
  } else {
    return metadataDecoratorOptions.get(metadataClassOrId);
  }
}

function clear() {
  metadataDecoratorOptions.clear();
  metadataIdDecoratorOptions.clear;
}

export {
  type CreateDecoratorExpOption,
  setOption,
  addClassOptionById,
  getOption,
  clear,
};
