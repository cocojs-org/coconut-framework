/**
 * 装饰器表达式的参数
 * 包含了元数据类和业务类的装饰器的参数
 */
import { type Field, type Kind } from './decorator-context';
import { isClass } from '../share/util';

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

// 将收集到的装饰器参数中，如果有占位符的元数据类，那么改为真实的元数据类
export function replacePlaceholderMetaClassParams2RealMetadataClassParams(
    placeholderClassMap2RealMetadataClass: Map<Class<any>, Class<any>>
) {
    for (const [placeholderMetaClass, beDecoratedClassList] of placeholderMataClassMap2BeDecoratedClass.entries()) {
        const realMetadataClass = placeholderClassMap2RealMetadataClass.get(placeholderMetaClass);
        if (!realMetadataClass) {
            console.log(
                '替换装饰器参数的占位的元数据类，没有找到的真实的元数据类',
                placeholderClassMap2RealMetadataClass,
                placeholderMataClassMap2BeDecoratedClass
            );
            throw new Error('替换装饰器参数的占位的元数据类，没有找到的真实的元数据类');
        }
        for (const beDecoratedClass of beDecoratedClassList) {
            const paramsList = decoratorParamMap.get(beDecoratedClass);
            for (const p of paramsList) {
                if (p.metadataClass === placeholderMetaClass) {
                    p.metadataClass = realMetadataClass;
                    p.placeholderMetadataClass = placeholderMetaClass;
                }
            }
        }
    }
}

export function get(): Map<Class<any>, Params[]> {
    return decoratorParamMap;
}

export function clear() {
    decoratorParamMap.clear();
}
