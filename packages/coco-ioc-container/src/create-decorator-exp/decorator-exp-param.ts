/**
 * 装饰器表达式的参数
 * 包含了元数据类和业务类的装饰器的参数
 */
import { type Field, type Kind } from './decorator-context';
import { isClass } from '../share/util';
import { createDiagnose, DiagnoseCode, stringifyDiagnose } from 'shared';

export type Params = {
    metadataKind: Kind;
    metadataClass: Class<any>;
    // 如果是使用createPlaceholderDecoratorExp创建的装饰器表达式，那么placeholderMetadataClass就是占位的元数据类
    placeholderMetadataClass?: Class<any>;
    metadataParam: any;
    /**
     * 如果metadataKind是'class'，field是undefined
     * 如果metadataKind是'method'\'field'，field就是对应的prop名字
     * todo 测试是否支持Symbol类型
     */
    field?: Field;
};
const decoratorParamMap: Map<Class<any>, Params[]> = new Map();

// 占位的元数据类 <--> 被装饰的类
const placeholderMataClassMap2BeDecoratedClass: Map<Class<any>, Class<any>[]> = new Map();

export interface IAddDecoratorParams {
    (isPlaceholderMetaClass: boolean, beDecoratedCls: Class<any>, params: Params): void;
}

/**
 * 保存装饰器参数
 * @param isPlaceholderMetaClass 是否是占位的元数据类
 * @param beDecoratedCls 被装饰的类
 * @param params
 */
export function addDecoratorParams(isPlaceholderMetaClass: boolean, beDecoratedCls: Class<any>, params: Params) {
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
    if (isPlaceholderMetaClass) {
        const beDecoratedClassList = placeholderMataClassMap2BeDecoratedClass.get(params.metadataClass);
        if (beDecoratedClassList) {
            beDecoratedClassList.push(beDecoratedCls);
        } else {
            placeholderMataClassMap2BeDecoratedClass.set(params.metadataClass, [beDecoratedCls]);
        }
    }
}

// 收集到的装饰器参数，其中部分装饰器对应的类是*占位*元数据类，那么替换成真实的元数据类
export function replacePlaceholderMetaClassParams2RealMetadataClassParams({
    placeholderClassMap2RealMetadataClass,
    notCalledDecorateSelfPlaceholderClassList,
}: {
    placeholderClassMap2RealMetadataClass: Map<Class<any>, Class<any>>;
    notCalledDecorateSelfPlaceholderClassList: Class<any>[];
}) {
    for (const [placeholderMetaClass, beDecoratedClassList] of placeholderMataClassMap2BeDecoratedClass.entries()) {
        const realMetadataClass = placeholderClassMap2RealMetadataClass.get(placeholderMetaClass);
        for (const beDecoratedClass of beDecoratedClassList) {
            if (!realMetadataClass) {
                throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10021, beDecoratedClass.name)));
            }
            const paramsList = decoratorParamMap.get(beDecoratedClass);
            for (const p of paramsList) {
                if (p.metadataClass === placeholderMetaClass) {
                    p.metadataClass = realMetadataClass;
                    p.placeholderMetadataClass = placeholderMetaClass;
                }
            }
        }
    }

    // 所有没有执行的decorateSelf函数的占位的装饰器表达式，如果也没有被使用，那么打印警告信息
    for (const placeholderMetaClass of notCalledDecorateSelfPlaceholderClassList) {
        if (__DEV__) {
            if (!placeholderClassMap2RealMetadataClass.has(placeholderMetaClass)) {
                console.warn(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10020)));
            }
        }
    }
}

export function getDecoratorParam(): Map<Class<any>, Params[]> {
    return decoratorParamMap;
}

export function clear() {
    decoratorParamMap.clear();
}
