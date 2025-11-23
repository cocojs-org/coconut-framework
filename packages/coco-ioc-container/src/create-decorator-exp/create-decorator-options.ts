/**
 * 创建装饰器表达式的选项
 */
import type Metadata from '../metadata/instantiate-one-metadata';
import type Application from '../application';
import { Field } from './decorator-context';

/**
 * @public
 * @param metadata - 元数据实例对象
 * @param application - 全局的application对象
 */
type ComponentClassPostConstructFn = (metadata: Metadata, application: Application) => void;
/**
 * @public
 * @param metadata - 元数据实例对象
 * @param application - 全局的application对象
 * @param field - 被装饰的字段名
 */
type ComponentFieldPostConstructFn = (metadata: Metadata, application: Application, field: Field) => void;
/**
 * @public
 */
type ComponentMethodPostConstructFn = (metadata: Metadata, application: Application, field: Field) => void;

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
const metadataDecoratorOptions: Map<Class<any>, CreateDecoratorExpOption> = new Map();
// 占位的元数据类 <--> 装饰器选项
const placeholderDecoratorOptions: Map<Class<any>, CreateDecoratorExpOption> = new Map();
// 占位的元数据类 <--> 真实的元数据类
const placeholderClassMap2RealMetadataClass: Map<Class<any>, Class<any>> = new Map();
// 没有调用decorateSelf函数的占位的元数据类
const notCalledDecorateSelfPlaceholderClassList: Class<any>[] = [];

// 记录创建装饰器表达式的选项
function addCreateDecoratorOption(
    isPlaceholderExp: boolean,
    metadataClass: Class<any>,
    options: CreateDecoratorExpOption = null
) {
    if (isPlaceholderExp) {
        // 是占位的元数据表达式，那么先临时记录到placeholderDecoratorOptions中，后续知道占位元数据类和真正的元数据类的映射关系后再保存到metadataDecoratorOptions中
        placeholderDecoratorOptions.set(metadataClass, options);
    } else {
        // 不是占位的元数据表达式，那么直接保存在metadataDecoratorOptions中
        metadataDecoratorOptions.set(metadataClass, options);
    }
}

// 记录占位的元数据类和真实的元数据类之间的映射
function addPlaceholderClassToRealMetadataClassRelation(placeholderClass: Class<any>, realMetadataClass: Class<any>) {
    placeholderClassMap2RealMetadataClass.set(placeholderClass, realMetadataClass);
}

// 添加占位的装饰器表达式的参数
function mergePlaceholderClass2RealMetadataClassRelation() {
    for (const [placeholderClass, decoratorOptions] of placeholderDecoratorOptions.entries()) {
        const realMetadataClass = placeholderClassMap2RealMetadataClass.get(placeholderClass);
        if (realMetadataClass) {
            addCreateDecoratorOption(false, realMetadataClass, decoratorOptions);
        } else {
            notCalledDecorateSelfPlaceholderClassList.push(placeholderClass);
        }
    }
}

function getCreateDecoratorOption(metadataClass: Class<any>) {
    return metadataDecoratorOptions.get(metadataClass);
}

function getPlaceholderClassMap2RealMetadataClass() {
    return { placeholderClassMap2RealMetadataClass, notCalledDecorateSelfPlaceholderClassList };
}

function clear() {
    metadataDecoratorOptions.clear();
    placeholderDecoratorOptions.clear();
    placeholderClassMap2RealMetadataClass.clear();
    notCalledDecorateSelfPlaceholderClassList.length = 0;
}

export {
    type CreateDecoratorExpOption,
    addCreateDecoratorOption,
    addPlaceholderClassToRealMetadataClassRelation,
    mergePlaceholderClass2RealMetadataClassRelation,
    getCreateDecoratorOption,
    clear,
    getPlaceholderClassMap2RealMetadataClass,
};
