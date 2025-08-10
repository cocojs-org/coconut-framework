import {
  type Context,
  type Decorator,
  KindClass,
  KindField,
  KindMethod,
  KindGetter,
  KindSetter,
  KindAccessor,
} from './decorator-context';
export type { Decorator };
import { isClass, lowercaseFirstLetter, once } from '../share/util';
import { addDecoratorParams } from './decorator-params';
import { registerMetadataCls } from './metadata';

function createDecoratorExpFactory(fn: any) {
  return function <UserParam, C extends Context>(
    metadataClsOrName: MetadataClass<any> | string
  ): (userParam?: UserParam, decorateSelf?: true) => Decorator<C> {
    const decoratorName =
      typeof metadataClsOrName === 'string'
        ? metadataClsOrName
        : lowercaseFirstLetter(metadataClsOrName.name);
    let MetadataCls =
      typeof metadataClsOrName !== 'string' ? metadataClsOrName : null;
    if (MetadataCls) {
      registerMetadataCls(MetadataCls);
    }
    function decoratorExpress(userParam: UserParam, decorateSelf?: true) {
      return function (value, context: C) {
        switch (context.kind) {
          case KindClass: {
            if (decorateSelf) {
              if (MetadataCls === null) {
                MetadataCls = value;
                registerMetadataCls(MetadataCls);
                fn(value, {
                  decoratorName,
                  metadataKind: KindClass,
                  metadataClass: value,
                  metadataParam: userParam,
                  postConstruct: value.postConstruct,
                });
              }
            } else {
              fn(value, {
                decoratorName,
                metadataKind: KindClass,
                metadataClass: MetadataCls,
                metadataParam: userParam,
                postConstruct: MetadataCls.postConstruct,
              });
            }
            // 修改prototype
            if (
              typeof MetadataCls?.classDecoratorModifyPrototype === 'function'
            ) {
              MetadataCls?.classDecoratorModifyPrototype(value.prototype);
            }
            break;
          }
          case KindGetter:
          case KindSetter:
          case KindAccessor:
            throw new Error(`暂不支持装饰${context.kind}类型。`);
          case KindMethod:
          case KindField:
          default:
            // ignore
            break;
        }
        const initializerOnce = once(function initializer() {
          switch (context.kind) {
            case KindField:
            case KindMethod:
              fn(this.constructor, {
                decoratorName,
                metadataKind: context.kind,
                metadataClass: MetadataCls,
                metadataParam: userParam,
                field: context.name as string,
                postConstruct: MetadataCls.postConstruct,
              });
              break;
            case KindClass:
              // ignore
              break;
          }
        });
        context.addInitializer(function () {
          initializerOnce(this);
        });
        return undefined;
      };
    }

    return decoratorExpress;
  };
}

const doCreateDecoratorExp = createDecoratorExpFactory(addDecoratorParams);

/**
 * 使用元数据类创建一个装饰器函数
 * 适用于装饰器不装饰自己元数据类的场景
 * @public
 */
function createDecoratorExp(
  metadataCls: Class<any>
): (userParam?: any) => Decorator<DecoratorContext> {
  if (!isClass(metadataCls)) {
    throw new Error('createDecoratorExp的第一个参数类型是类');
  }
  return doCreateDecoratorExp(metadataCls);
}

/**
 * 使用装饰器名字创建一个装饰器函数
 * 适用于装饰器装饰自己元数据类的场景
 * @public
 */
function createDecoratorExpByName(
  decoratorName: string
): (userParam?: any, decorateSelf?: true) => Decorator<DecoratorContext> {
  if (typeof decoratorName !== 'string') {
    throw new Error(
      'createDecoratorExpByName的第一个参数类型是字符串，表示装饰器的名字'
    );
  }
  return doCreateDecoratorExp(decoratorName);
}

export {
  createDecoratorExp,
  createDecoratorExpByName,
  createDecoratorExpFactory,
};
