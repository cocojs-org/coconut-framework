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
import { isSubClassOf, once } from '../share/util';
import { addDecoratorParams, IAddDecoratorParams } from './decorator-exp-param';
import {
    addCreateDecoratorOption,
    addPlaceholderClassToRealMetadataClassRelation,
    type CreateDecoratorExpOption,
} from './create-decorator-options';
import { createDiagnose, DiagnoseCode, stringifyDiagnose } from 'shared';
import Metadata from '../metadata/instantiate-one-metadata';

let createdDecoratorMetadataSet: Set<Class<any>> = new Set();

function checkIfMetadataCreateMoreThenOneDecorator(metadataClass: Class<any>) {
    if (!createdDecoratorMetadataSet.has(metadataClass)) {
        createdDecoratorMetadataSet.add(metadataClass);
    } else {
        throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10014, metadataClass.name)));
    }
}

interface DecoratorExp {
    (userParam?: any): Decorator<DecoratorContext>;
}
interface DecoratorExpWithDecoratorSelf<T extends any> {
    (userParam?: T): Decorator<DecoratorContext>;
    decorateSelf: (userParam?: T) => Decorator<DecoratorContext>;
}

function createDecoratorExpFactory(fn: IAddDecoratorParams) {
    return function <UserParam, C extends Context>(
        isPlaceholderExp: boolean,
        metadataClass: MetadataClass<any>,
        option?: CreateDecoratorExpOption
    ): DecoratorExp | DecoratorExpWithDecoratorSelf<any> {
        const MetaClsOrPlaceholderMetaCls = metadataClass;
        addCreateDecoratorOption(isPlaceholderExp, MetaClsOrPlaceholderMetaCls, option);
        if (!isPlaceholderExp) {
            checkIfMetadataCreateMoreThenOneDecorator(MetaClsOrPlaceholderMetaCls);
        }

        function decorateSelf(userParam: UserParam) {
            return function (beDecoratedCls, context: C) {
                switch (context.kind) {
                    case KindClass: {
                        if (isPlaceholderExp) {
                            addPlaceholderClassToRealMetadataClassRelation(MetaClsOrPlaceholderMetaCls, beDecoratedCls);
                            checkIfMetadataCreateMoreThenOneDecorator(beDecoratedCls);
                        } else {
                            throw new Error('decorateSelf函数只能调用一次');
                        }
                        fn(isPlaceholderExp, beDecoratedCls, {
                            metadataKind: KindClass,
                            metadataClass: MetaClsOrPlaceholderMetaCls,
                            metadataParam: userParam,
                        });
                        // 修改prototype
                        // TODO: 下面应该判断的是beDecoratedCls?.classDecoratorModifyPrototype
                        if (typeof MetaClsOrPlaceholderMetaCls?.classDecoratorModifyPrototype === 'function') {
                            MetaClsOrPlaceholderMetaCls?.classDecoratorModifyPrototype(beDecoratedCls.prototype);
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
                        fn(isPlaceholderExp, beDecoratedCls, {
                            metadataKind: KindClass,
                            metadataClass: MetaClsOrPlaceholderMetaCls,
                            metadataParam: userParam,
                        });
                        // 修改prototype
                        if (typeof MetaClsOrPlaceholderMetaCls?.classDecoratorModifyPrototype === 'function') {
                            MetaClsOrPlaceholderMetaCls?.classDecoratorModifyPrototype(beDecoratedCls.prototype);
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
                            fn(isPlaceholderExp, this.constructor, {
                                metadataKind: context.kind,
                                metadataClass: MetaClsOrPlaceholderMetaCls,
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

        if (isPlaceholderExp) {
            decoratorExpress.decorateSelf = decorateSelf;
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
function createDecoratorExp(metadataCls: Class<any>, option?: CreateDecoratorExpOption): DecoratorExp {
    if (!isSubClassOf(metadataCls, Metadata)) {
        throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10018, metadataCls?.name)));
    }
    return doCreateDecoratorExp(false, metadataCls, option) as DecoratorExp;
}

/**
 * 创建一个未绑定元数据的装饰器表达式，后续通过表达式的第二个参数来绑定
 * 适用于装饰器装饰自己元数据类的场景
 * @public
 */
function createPlaceholderDecoratorExp<T>(option?: CreateDecoratorExpOption): DecoratorExpWithDecoratorSelf<T> {
    // 先提供一个默认的元数据类，再替换为真实的元数据类
    class PlaceholderMetadata extends Metadata {}
    return doCreateDecoratorExp(true, PlaceholderMetadata, option) as DecoratorExpWithDecoratorSelf<T>;
}

export {
    type DecoratorExp,
    type DecoratorExpWithDecoratorSelf,
    createDecoratorExp,
    createPlaceholderDecoratorExp,
    createDecoratorExpFactory,
};
