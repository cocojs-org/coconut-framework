/**
 * 创建装饰器表达式的选项
 */
import type Metadata from '../metadata/create-metadata';
import type Application from '../application';
import { getId } from '../share/util';
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
// 元数据类id <--> 装饰器选项
const metadataIdDecoratorOptions: Map<string, CreateDecoratorExpOption> = new Map();
// 占位的元数据类 <--> 装饰器选项
const placeholderDecoratorOptions: Map<Class<any>, CreateDecoratorExpOption> = new Map();
// 占位的元数据类 <--> 真实的元数据类
const placeholderClassMap2RealMetadataClass: Map<Class<any>, Class<any>> = new Map();

// 记录创建装饰器表达式的选项
function addCreateDecoratorOption(
    isPlaceholderExp: boolean,
    metadataClass: Class<any>,
    options: CreateDecoratorExpOption = null
) {
    if (isPlaceholderExp) {
        // 是占位的元数据表达式，那么先临时记录到placeholderDecoratorOptions中，后续转存到metadataIdDecoratorOptions, metadataDecoratorOptions中
        placeholderDecoratorOptions.set(metadataClass, options);
    } else {
        // 不是占位的元数据表达式，那么直接记录参数
        const id = getId(metadataClass);
        metadataIdDecoratorOptions.set(id, options);
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
            throw new Error('占位的元数据类没有对应的真实的元数据类');
        }
    }
}

function getOption(metadataClassOrId: Class<any> | string) {
    if (typeof metadataClassOrId === 'string') {
        return metadataIdDecoratorOptions.get(metadataClassOrId);
    } else {
        return metadataDecoratorOptions.get(metadataClassOrId);
    }
}

function getPlaceholderClassMap2RealMetadataClass() {
    return placeholderClassMap2RealMetadataClass;
}

function clear() {
    metadataDecoratorOptions.clear();
    metadataIdDecoratorOptions.clear();
    placeholderDecoratorOptions.clear();
    placeholderClassMap2RealMetadataClass.clear();
}

export {
    type CreateDecoratorExpOption,
    addCreateDecoratorOption,
    addPlaceholderClassToRealMetadataClassRelation,
    mergePlaceholderClass2RealMetadataClassRelation,
    getOption,
    clear,
    getPlaceholderClassMap2RealMetadataClass,
};
