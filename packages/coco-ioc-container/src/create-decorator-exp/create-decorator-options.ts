/**
 * 创建装饰器表达式的选项
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

// 元数据类 <--> 装饰器选项
const metadataDecoratorOptions: Map<
  Class<any>,
  CreateDecoratorExpOption
> = new Map();
// 元数据类id <--> 装饰器选项
const metadataIdDecoratorOptions: Map<string, CreateDecoratorExpOption> =
  new Map();

function addOptionForCreateDecoratorExp(
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

// 针对createDecoratorExpByName构建的装饰器，一开始是id，后续才知道元数据类
function polyfillClassOptionForCreateDecoratorExpByName(
  metadataId: string,
  metadataClass: Class<any>
) {
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
  addOptionForCreateDecoratorExp,
  polyfillClassOptionForCreateDecoratorExpByName,
  getOption,
  clear,
};
