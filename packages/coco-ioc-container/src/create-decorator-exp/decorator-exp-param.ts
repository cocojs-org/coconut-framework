/**
 * 装饰器表达式的参数
 * 包含了元数据类和业务类的装饰器的参数
 */
import { type Field, type Kind } from './decorator-context';
import { isClass } from '../share/util';

export type Params = {
  decoratorName?: string;
  metadataKind: Kind;
  metadataClass: Class<any>;
  metadataParam: any;
  /**
   * 如果metadataKind是'class'，field是undefined
   * 如果metadataKind是'method'\'field'，field就是对应的prop名字
   * todo 测试是否支持Symbol类型
   */
  field?: Field;
};
const decoratorParamMap: Map<Class<any>, Params[]> = new Map();

/**
 * 保存装饰器参数
 * @param beDecoratedCls 被装饰的类
 * @param params
 */
export function addDecoratorParams(beDecoratedCls: Class<any>, params: Params) {
  if (!isClass(beDecoratedCls)) {
    if (__DEV__) {
      console.error('错误的装饰目标类', beDecoratedCls);
    }
    return;
  }

  // TODO: 装饰器不应该允许重复添加，但是又需要允许添加类装饰器，field装饰器这样的场景
  if (!decoratorParamMap.has(beDecoratedCls)) {
    decoratorParamMap.set(beDecoratedCls, []);
  }
  const paramsList = decoratorParamMap.get(beDecoratedCls);
  paramsList.push(params);
}

export function get(): Map<Class<any>, Params[]> {
  return decoratorParamMap;
}

export function clear() {
  decoratorParamMap.clear();
}
