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
        const placeholderDecoratorModifyPrototype: Map<
            Class<any>,
            {
                /**
                 * 待修改原型类的被装饰类的集合
                 */
                toUpdateClassSet?: Set<Class<any>>;
                /**
                 * 如果函数不为undefined和null，说明已经调用过decorateSelf，且有classDecoratorModifyPrototype，则直接执行即可
                 * 如果函数为null，说明已经调用decorateSelf，但没有classDecoratorModifyPrototype函数
                 * 如果函数为undefined，说明还没有调用过decorateSelf
                 */
                classDecoratorModifyPrototype?: Function | undefined | null;
            }
        > = new Map();

        function decorateSelf(userParam: UserParam) {
            return function (beDecoratedCls: any, context: C) {
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
                        const config = placeholderDecoratorModifyPrototype.get(MetaClsOrPlaceholderMetaCls);
                        if (typeof beDecoratedCls?.classDecoratorModifyPrototype === 'function') {
                            // 直接flush掉待修改的类，然后设置成修改函数即可。
                            if (config && config.toUpdateClassSet.size) {
                                for (const cls of Array.from(config.toUpdateClassSet)) {
                                    beDecoratedCls?.classDecoratorModifyPrototype(cls.prototype);
                                }
                            }
                            placeholderDecoratorModifyPrototype.set(MetaClsOrPlaceholderMetaCls, {
                                classDecoratorModifyPrototype: beDecoratedCls.classDecoratorModifyPrototype,
                            });
                        } else {
                            placeholderDecoratorModifyPrototype.set(MetaClsOrPlaceholderMetaCls, {
                                classDecoratorModifyPrototype: null,
                            });
                        }
                        break;
                    }
                    default:
                        throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10019, context.kind)));
                }
                return undefined;
            };
        }

        function doCreateDecoratorExp(userParam: UserParam) {
            return function (beDecoratedCls, context: C) {
                switch (context.kind) {
                    case KindClass: {
                        fn(isPlaceholderExp, beDecoratedCls, {
                            metadataKind: KindClass,
                            metadataClass: MetaClsOrPlaceholderMetaCls,
                            metadataParam: userParam,
                        });
                        // 修改prototype
                        if (isPlaceholderExp) {
                            const config = placeholderDecoratorModifyPrototype.get(MetaClsOrPlaceholderMetaCls);
                            if (!config) {
                                // 第一次遇到，先收集
                                const toUpdateClassSet: Set<Class<any>> = new Set();
                                toUpdateClassSet.add(beDecoratedCls);
                                placeholderDecoratorModifyPrototype.set(MetaClsOrPlaceholderMetaCls, {
                                    toUpdateClassSet,
                                });
                            } else {
                                if (config.classDecoratorModifyPrototype) {
                                    // 已经装饰过自己了，直接修改
                                    config.classDecoratorModifyPrototype(beDecoratedCls.prototype);
                                } else {
                                    if (config.classDecoratorModifyPrototype === undefined) {
                                        // 又装饰器其他类，同样收集
                                        config.toUpdateClassSet.add(beDecoratedCls);
                                    } else if (config.classDecoratorModifyPrototype === null) {
                                        // 不需要更新了，清空即可
                                        config.toUpdateClassSet?.clear();
                                    }
                                }
                            }
                        } else {
                            // 不是占位装饰器，直接修改被装饰类的原型链
                            if (typeof MetaClsOrPlaceholderMetaCls?.classDecoratorModifyPrototype === 'function') {
                                MetaClsOrPlaceholderMetaCls?.classDecoratorModifyPrototype(beDecoratedCls.prototype);
                            }
                        }
                        break;
                    }
                    case KindMethod:
                    case KindField:
                        break;
                    case KindGetter:
                    case KindSetter:
                    case KindAccessor:
                    default:
                        throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10019, context.kind)));
                }
                const execOnce = once(function initializer() {
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
                    }
                });
                context.addInitializer(function () {
                    execOnce(this);
                });
                return undefined;
            };
        }

        if (isPlaceholderExp) {
            doCreateDecoratorExp.decorateSelf = decorateSelf;
        }
        return doCreateDecoratorExp;
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
    type Decorator,
    type DecoratorExp,
    type DecoratorExpWithDecoratorSelf,
    createDecoratorExp,
    createPlaceholderDecoratorExp,
    createDecoratorExpFactory,
};
