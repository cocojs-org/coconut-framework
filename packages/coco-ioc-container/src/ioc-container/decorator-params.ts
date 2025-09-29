import type { ComponentPostConstructFn } from './ioc-component-definition';
import {
  type Field,
  type Kind,
  KindClass,
  KindMethod,
} from './decorator-context';
import { isClass } from '../share/util';
import { get as getFromShare, NAME } from 'shared';

export type params = {
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
  componentPostConstruct?: ComponentPostConstructFn;
};
const decoratorParamMap: Map<Class<any>, params[]> = new Map();

/**
 * 保存装饰器参数
 * @param beDecoratedCls 被装饰的类
 * @param params
 */
export function addDecoratorParams(beDecoratedCls: Class<any>, params: params) {
  if (!isClass(beDecoratedCls)) {
    if (__DEV__) {
      console.error('错误的装饰目标类', beDecoratedCls);
    }
    return;
  }

  // todo 装饰器不应该允许重复添加，但是又需要允许添加类装饰器，field装饰器这样的场景
  if (!decoratorParamMap.has(beDecoratedCls)) {
    decoratorParamMap.set(beDecoratedCls, []);
  }
  const paramsList = decoratorParamMap.get(beDecoratedCls);
  paramsList.push(params);
}

/**
 * 被装饰类的类装饰器是否包含了某元数据类
 * @param beDecoratedCls
 * @param targetMetadataCls
 * @param upward 用于设置继续在类装饰器的元数据的类装饰器上继续查找
 * 如果设置0（默认），表示只查找 beDecoratedCls的类装饰器
 * 如果设置1，表示还会查找beDecoratedCls的类装饰器 的元数据的类装饰器
 * 如果设置2，表示还会查找beDecoratedCls的类装饰器 的元数据的类装饰器 的元数据的类装饰器
 * 数字+1，即继续查找元数据的类装饰器
 */
export function isIncludesClassDecorator(
  beDecoratedCls: Class<any>,
  targetMetadataCls: Class<any>,
  upward: number = 0
): boolean {
  if (upward < 0) {
    return false;
  }

  const allDecoratorParams = decoratorParamMap.get(beDecoratedCls);
  if (!allDecoratorParams) {
    return false;
  }
  // 当前类装饰器
  const classDecoratorParams = allDecoratorParams.filter(
    (i) => i.metadataKind === KindClass
  );
  if (
    classDecoratorParams.find(
      (params) => params.metadataClass === targetMetadataCls
    )
  ) {
    return true;
  }
  // 元数据的类装饰器
  for (const classDecoratorParam of classDecoratorParams) {
    const find = isIncludesClassDecorator(
      classDecoratorParam.metadataClass,
      targetMetadataCls,
      upward - 1
    );
    if (find) {
      return true;
    }
  }
  return false;
}

export function isIncludesMethodDecorator(
  beDecoratedCls: Class<any>,
  targetMetadataCls: Class<any>
): params {
  const allDecoratorParams = decoratorParamMap.get(beDecoratedCls);
  if (!allDecoratorParams) {
    return null;
  }
  const methodDecoratorParams = allDecoratorParams.filter(
    (i) => i.metadataKind === KindMethod
  );
  const find = methodDecoratorParams.find(
    (params) => params.metadataClass === targetMetadataCls
  );
  return find || null;
}

export function get(): Map<Class<any>, params[]> {
  return decoratorParamMap;
}

export function clear() {
  decoratorParamMap.clear();
}
