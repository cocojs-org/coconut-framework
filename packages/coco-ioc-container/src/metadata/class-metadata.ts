/**
 * 类的元数据集合
 * 类又可以分成元数据类和业务类：元数据类都是Metadata的子类，业务类是普通的类（非Metadata的子类）
 * 元数据的实例通过装饰器一一对应的元数据类加上装饰器表达式的参数实例化得到，具体见create-metadata.ts
 */
import Metadata, { instantiateMetadata } from './instantiate-one-metadata';
import { type Field } from '../create-decorator-exp';

// 元数据子类的元数据
export interface MetaMetadata {
    classMetadata: Metadata[];
}
const metaMetadataMap: Map<Class<Metadata>, MetaMetadata> = new Map();

// 非元数据子类（业务类）的元数据
export interface BizMetadata {
    classMetadata: Metadata[];
    fieldMetadata: Map<Field, Metadata[]>;
    methodMetadata: Map<Field, Metadata[]>;
}
const bizMetadataMap: Map<Class<any>, BizMetadata> = new Map();

function getAll(): [Map<Class<Metadata>, MetaMetadata>, Map<Class<Metadata>, BizMetadata>] {
    return [metaMetadataMap, bizMetadataMap];
}

function clearAll() {
    metaMetadataMap.clear();
    bizMetadataMap.clear();
}

// 返回指定类的所有元数据
function getMetadataByClass(Cls: Class<any>) {
    const value: {
        classMetadata: Metadata[];
        fieldMetadata?: Map<Field, Metadata[]>;
        methodMetadata?: Map<Field, Metadata[]>;
    } = Object.getPrototypeOf(Cls) === Metadata ? metaMetadataMap.get(Cls) : bizMetadataMap.get(Cls);
    return value;
}

function addToMap(cls: Class<any>) {
    let config;
    if (Object.getPrototypeOf(cls) === Metadata) {
        config = metaMetadataMap.get(cls);
        if (!config) {
            config = { classMetadata: [] };
            metaMetadataMap.set(cls, config);
        }
    } else {
        config = bizMetadataMap.get(cls);
        if (!config) {
            config = {
                classMetadata: [],
                fieldMetadata: new Map(),
                methodMetadata: new Map(),
            };
            bizMetadataMap.set(cls, config);
        }
    }
    return config;
}

function existSameMetadata(exited: Metadata[], metadataCls: Class<Metadata>): boolean {
    return exited.some((i) => i instanceof metadataCls);
}

// 为一个类添加类类型的元数据
function addClassKindMetadata(cls: Class<any>, MetadataCls?: Class<Metadata>, args?: any) {
    let config = getMetadataByClass(cls);
    if (!config) {
        config = addToMap(cls);
    }
    const classMetadata: Metadata[] = config.classMetadata;
    if (MetadataCls) {
        if (__DEV__ && existSameMetadata(classMetadata, MetadataCls)) {
            // TODO: 挪到validate中
            // console.warn(`${cls}已经存在相同的注解【${MetadataCls}】，忽略`);
            // return;
        }
        const metadata = instantiateMetadata(MetadataCls, args);
        classMetadata.push(metadata);
    }
}

function addFieldKindMetadata(Cls: Class<any>, fieldName: Field, MetadataCls: Class<Metadata>, args?: any) {
    let config = getMetadataByClass(Cls);
    if (!config) {
        config = addToMap(Cls);
    }
    // if (Object.getPrototypeOf(Cls) === Metadata) {
    //   // TODO: 挪到validate中
    //   throw new Error('目前元数据的类只支持类装饰器');
    // }
    const { fieldMetadata } = config;
    let fieldMetas = fieldMetadata.get(fieldName);
    if (!fieldMetas) {
        fieldMetas = [];
        fieldMetadata.set(fieldName, fieldMetas);
    }
    // if (fieldMetas.find((i) => i instanceof MetadataCls)) {
    //   if (__TEST__) {
    //     // TODO: 挪到validate中
    //     throw new Error('相同的Field装饰器装饰了2次!');
    //   }
    // }
    const metadata = instantiateMetadata(MetadataCls, args);
    fieldMetas.push(metadata);
}

function addMethodKindMetadata(Cls: Class<any>, fieldName: Field, MetadataCls: Class<Metadata>, args?: any) {
    let config = getMetadataByClass(Cls);
    if (!config) {
        config = addToMap(Cls);
    }
    // if (Object.getPrototypeOf(Cls) === Metadata) {
    //   // TODO: 挪到validate中
    //   throw new Error('目前元数据的类只支持类装饰器');
    // }
    const { methodMetadata } = config;
    let methodMetas = methodMetadata.get(fieldName);
    if (!methodMetas) {
        methodMetas = [];
        methodMetadata.set(fieldName, methodMetas);
    }
    // if (methodMetas.find((i) => i instanceof MetadataCls)) {
    //   if (__TEST__) {
    //     // TODO: 挪到validate中
    //     throw new Error('相同的Field装饰器装饰了2次!');
    //   }
    // }
    const metadata = instantiateMetadata(MetadataCls, args);
    methodMetas.push(metadata);
}

/**
 * 获取指定类的类类型的元数据
 * @param beDecoratedCls 指定类
 * @param findMetadataCls 如果不指定，返回全部；否则进行列表过滤
 */
function listClassKindMetadata(beDecoratedCls: Class<any>, findMetadataCls?: Class<any>) {
    const value = getMetadataByClass(beDecoratedCls);
    if (!value) {
        if (__DEV__) {
            console.error(`未注册的组件：`, beDecoratedCls.name);
        }
        return [];
    }

    return value.classMetadata.filter((i) => {
        return findMetadataCls ? i instanceof findMetadataCls : true;
    });
}

/**
 * 获取指定类的字段类型的元数据
 * @param beDecoratedCls 指定类
 * @param field 指定field名
 * @param findMetadataCls 如果不指定，返回全部；否则进行列表过滤
 */
function listFieldKindMetadata(beDecoratedCls: Class<any>, field: Field, findMetadataCls?: Class<any>) {
    const value = getMetadataByClass(beDecoratedCls);
    if (!value) {
        if (__DEV__) {
            console.error(`未注册的组件：`, beDecoratedCls);
        }
        return [];
    }
    return value.fieldMetadata.get(field).filter((i) => {
        return findMetadataCls ? i instanceof findMetadataCls : true;
    });
}

/**
 * 获取指定类的方法类型的元数据
 * @param beDecoratedCls 指定类
 * @param field 指定method名
 * @param findMetadataCls 如果不指定，返回全部；否则进行列表过滤
 */
function listMethodKindMetadata(beDecoratedCls: Class<any>, field: Field, findMetadataCls?: Class<any>) {
    const value = getMetadataByClass(beDecoratedCls);
    if (!value) {
        if (__DEV__) {
            console.error(`未注册的组件：`, beDecoratedCls);
        }
        return [];
    }
    return value.methodMetadata.get(field).filter((i) => {
        return findMetadataCls ? i.constructor === findMetadataCls : true;
    });
}

/**
 * 在类的所有类类型的元数据中递归查找某个元数据类实例，找到就直接返回
 */
function findClassKindMetadataRecursively(beDecoratedCls: Class<any>, TargetCls: Class<any>, upward: number = 0) {
    if (upward < 0) {
        return null;
    }
    const classMetadataList = listClassKindMetadata(beDecoratedCls);
    if (!classMetadataList) {
        return null;
    }
    const instance = classMetadataList.find((i) => i instanceof TargetCls);
    if (instance) {
        return instance;
    }
    for (const metadata of classMetadataList) {
        const find = findClassKindMetadataRecursively(<Class<any>>metadata.constructor, TargetCls, upward - 1);
        if (find) {
            return find;
        }
    }

    return null;
}

/**
 * 返回包含指定元数据类的所有field
 * @param beDecoratedCls 指定类
 * @param MetadataCls 指定元数据类
 */
function listFieldByMetadataCls(beDecoratedCls: Class<any>, MetadataCls: Class<any>): Field[] {
    const def = bizMetadataMap.get(beDecoratedCls);
    if (!def) {
        return [];
    }
    const fields = [];
    for (const [key, value] of def.fieldMetadata.entries()) {
        if (value.find((i) => i instanceof MetadataCls)) {
            fields.push(key);
        }
    }
    return fields;
}

/**
 * 返回包含指定元数据类的所有method
 * @param beDecoratedCls 指定类
 * @param MetadataCls 指定元数据类
 */
function listMethodByMetadataCls(beDecoratedCls: Class<any>, MetadataCls: Class<any>): Field[] {
    const def = bizMetadataMap.get(beDecoratedCls);
    if (!def) {
        return [];
    }
    const methods = [];
    for (const [key, value] of def.methodMetadata.entries()) {
        if (value.find((i) => i instanceof MetadataCls)) {
            methods.push(key);
        }
    }
    return methods;
}

// 通过一个类类型的元数据，找到所有被该元数据装饰的类
function listBeDecoratedClsByClassKindMetadata(MetadataCls: Class<any>): Map<Class<any>, Metadata> {
    const rlt = new Map<Class<any>, Metadata>();
    for (const [beDecoratedCls, { classMetadata }] of bizMetadataMap.entries()) {
        const find = classMetadata.find((i) => i instanceof MetadataCls);
        if (find) {
            rlt.set(beDecoratedCls, find);
        }
    }
    return rlt;
}

export {
    getAll as getAllMetadata,
    clearAll as clearAllMetadata,
    getMetadataByClass,
    addClassKindMetadata,
    addFieldKindMetadata,
    addMethodKindMetadata,
    listClassKindMetadata,
    listFieldKindMetadata,
    listMethodKindMetadata,
    findClassKindMetadataRecursively,
    listFieldByMetadataCls,
    listMethodByMetadataCls,
    listBeDecoratedClsByClassKindMetadata,
};
