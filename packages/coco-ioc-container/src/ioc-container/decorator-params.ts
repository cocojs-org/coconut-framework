import type { PostConstructFn } from './ioc-component-definition.ts';
import { type Field, type Kind, KindClass } from './decorator-context.ts';
import { isClass } from '../share/util.ts';
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
  postConstruct?: PostConstructFn;
};
const decoratorParamMap: Map<Class<any>, params[]> = new Map();

function isComponentSubMetadata(p: params, upward: number = 2) {
  if (upward < 0) {
    return false;
  }
  const Component = getFromShare(NAME.Component);
  if (p.metadataKind === KindClass && p.metadataClass === Component) {
    return true;
  } else {
    const params = decoratorParamMap.get(p.metadataClass) || [];
    return !!params.find((p) => isComponentSubMetadata(p, upward - 1));
  }
}
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

  if (!decoratorParamMap.has(beDecoratedCls)) {
    decoratorParamMap.set(beDecoratedCls, []);
  }
  const paramsList = decoratorParamMap.get(beDecoratedCls);
  const isComponent = isComponentSubMetadata(params);
  const hadComponent = !!paramsList.find((p) => isComponentSubMetadata(p));
  if (isComponent && hadComponent) {
    throw new Error(
      '一个类只能添加一个component装饰器，包含component复合装饰器！'
    );
  }
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

export function get(): Map<Class<any>, params[]> {
  return decoratorParamMap;
}

export function clear() {
  decoratorParamMap.clear();
}
