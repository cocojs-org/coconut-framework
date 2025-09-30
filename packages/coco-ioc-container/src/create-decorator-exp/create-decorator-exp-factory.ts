import {
  type Context,
  type Decorator,
  KindClass,
  KindField,
  KindMethod,
  KindGetter,
  KindSetter,
  KindAccessor,
  type Kind,
} from './decorator-context';
export type { Decorator };
import {
  isClass,
  lowercaseFirstLetter,
  once,
  uppercaseFirstLetter,
} from '../share/util';
import { addDecoratorParams } from './decorator-exp-param';
import {
  addDecoratorOption,
  type CreateDecoratorExpOption,
} from './create-decorator-options';

function createDecoratorExpFactory(fn: any) {
  return function <UserParam, C extends Context>(
    metadataClass?: MetadataClass<any>,
    option?: CreateDecoratorExpOption
  ): (userParam?: UserParam, decorateSelf?: true) => Decorator<C> {
    const createByClass = typeof metadataClass === 'function';
    let MetadataCls = null;
    if (createByClass) {
      MetadataCls = metadataClass;
      addDecoratorOption(MetadataCls, option);
    }

    function selfDecoratorExp(userParam: UserParam) {
      return function (beDecoratedCls, context: C) {
        switch (context.kind) {
          case KindClass: {
            if (MetadataCls === null) {
              MetadataCls = beDecoratedCls;
              addDecoratorOption(MetadataCls, option);
            } else {
              throw new Error('decorateSelf函数只能调用一次');
            }
            fn(beDecoratedCls, {
              metadataKind: KindClass,
              metadataClass: MetadataCls,
              metadataParam: userParam,
            });
            // 修改prototype
            if (
              typeof MetadataCls?.classDecoratorModifyPrototype === 'function'
            ) {
              MetadataCls?.classDecoratorModifyPrototype(
                beDecoratedCls.prototype
              );
            }
            break;
          }
          default:
            throw new Error(`暂不支持装饰${context.kind}类型。`);
        }
        return undefined;
      };
    }

    function decoratorExpress(userParam: UserParam) {
      return function (beDecoratedCls, context: C) {
        switch (context.kind) {
          case KindClass: {
            if (MetadataCls === null) {
              throw new Error('你需要先执行bindMetadata函数');
            }
            fn(beDecoratedCls, {
              metadataKind: KindClass,
              metadataClass: MetadataCls,
              metadataParam: userParam,
            });
            // 修改prototype
            if (
              typeof MetadataCls?.classDecoratorModifyPrototype === 'function'
            ) {
              MetadataCls?.classDecoratorModifyPrototype(
                beDecoratedCls.prototype
              );
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
                metadataKind: context.kind,
                metadataClass: MetadataCls,
                metadataParam: userParam,
                field: context.name as string,
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

    if (!createByClass) {
      decoratorExpress.selfDecoratorExp = selfDecoratorExp;
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
  metadataCls: Class<any>,
  option?: CreateDecoratorExpOption
): (userParam?: any) => Decorator<DecoratorContext> {
  if (!isClass(metadataCls)) {
    throw new Error('createDecoratorExp的第一个参数类型是类');
  }
  return doCreateDecoratorExp(metadataCls, option);
}

/**
 * 创建一个未绑定元数据的装饰器表达式，后续通过表达式的第二个参数来绑定
 * 适用于装饰器装饰自己元数据类的场景
 * @public
 */
function createPlaceholderDecoratorExp(
  option?: CreateDecoratorExpOption
): (userParam?: any, decorateSelf?: true) => Decorator<DecoratorContext> {
  return doCreateDecoratorExp(undefined, option);
}

export {
  createDecoratorExp,
  createPlaceholderDecoratorExp,
  createDecoratorExpFactory,
};
