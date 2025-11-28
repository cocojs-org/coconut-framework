/**
 * 元数据仓库（运行时所有元数据的数据）
 * 类又可以分成元数据类和业务类：元数据类都是Metadata的子类，业务类是普通的类（非Metadata的子类）
 * 元数据的实例通过装饰器一一对应的元数据类加上装饰器表达式的参数实例化得到，具体见create-metadata.ts
 */
import Metadata, { instantiateMetadata } from './instantiate-one-metadata';
import { KindClass, KindField, KindMethod, type Field } from '../create-decorator-exp';
import { type Params } from '../create-decorator-exp/decorator-exp-param';
import { createDiagnose, DiagnoseCode, printDiagnose, stringifyDiagnose } from 'shared';

// 元数据子类的元数据
export interface MetaMetadata {
    classMetadata: Metadata[];
    fieldMetadata: Map<Field, Metadata[]>; // 元数据类是没有字段装饰器的，但用户可能误加了，那么启动的时候保存起来，校验时去掉
    methodMetadata: Map<Field, Metadata[]>; // 元数据类是没有方法装饰器的，但用户可能误加了，那么启动的时候保存起来，校验时去掉
}

// 非元数据子类（业务类）的元数据
export interface BizMetadata {
    classMetadata: Metadata[];
    fieldMetadata: Map<Field, Metadata[]>;
    methodMetadata: Map<Field, Metadata[]>;
}

class MetadataRepository {
    private metaMetadataMap: Map<Class<Metadata>, MetaMetadata> = new Map();
    private bizMetadataMap: Map<Class<any>, BizMetadata> = new Map();

    constructor(decoratorMap: Map<Class<any>, Params[]>) {
        for (const entity of decoratorMap.entries()) {
            const beDecoratedCls = entity[0];
            const list = entity[1];
            for (const p of list) {
                const metadataKind = p.metadataKind;
                const metadataClass = p.metadataClass;
                const metadataParam = p.metadataParam;
                const field = p.field;
                switch (metadataKind) {
                    case KindClass:
                        this.addClassKindMetadata(beDecoratedCls, metadataClass, metadataParam);
                        break;
                    case KindField:
                        this.addFieldKindMetadata(beDecoratedCls, field, metadataClass, metadataParam);
                        break;
                    case KindMethod:
                        this.addMethodKindMetadata(beDecoratedCls, field, metadataClass, metadataParam);
                        break;
                }
            }
        }
    }

    getAll(): [Map<Class<Metadata>, MetaMetadata>, Map<Class<Metadata>, BizMetadata>] {
        return [this.metaMetadataMap, this.bizMetadataMap];
    }

    destructor() {
        this.metaMetadataMap.clear();
        this.bizMetadataMap.clear();
    }
    // 返回指定类的所有元数据
    getMetadataByClass(Cls: Class<any>) {
        const value: {
            classMetadata: Metadata[];
            fieldMetadata?: Map<Field, Metadata[]>;
            methodMetadata?: Map<Field, Metadata[]>;
        } = Object.getPrototypeOf(Cls) === Metadata ? this.metaMetadataMap.get(Cls) : this.bizMetadataMap.get(Cls);
        return value;
    }

    private addToMap(cls: Class<any>) {
        const map = Object.getPrototypeOf(cls) === Metadata ? this.metaMetadataMap : this.bizMetadataMap;
        let config = map.get(cls);
        if (!config) {
            config = {
                classMetadata: [],
                fieldMetadata: new Map(),
                methodMetadata: new Map(),
            };
            map.set(cls, config);
        }
        return config;
    }

    // 为一个类添加类类型的元数据
    addClassKindMetadata(cls: Class<any>, MetadataCls?: Class<Metadata>, args?: any) {
        let config = this.getMetadataByClass(cls);
        if (!config) {
            config = this.addToMap(cls);
        }
        const classMetadata: Metadata[] = config.classMetadata;
        if (MetadataCls) {
            const metadata = instantiateMetadata(MetadataCls, args);
            classMetadata.push(metadata);
        }
    }

    addFieldKindMetadata(Cls: Class<any>, fieldName: Field, MetadataCls: Class<Metadata>, args?: any) {
        let config = this.getMetadataByClass(Cls);
        if (!config) {
            config = this.addToMap(Cls);
        }
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

    addMethodKindMetadata(Cls: Class<any>, fieldName: Field, MetadataCls: Class<Metadata>, args?: any) {
        let config = this.getMetadataByClass(Cls);
        if (!config) {
            config = this.addToMap(Cls);
        }
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
    listClassKindMetadata(beDecoratedCls: Class<any>, findMetadataCls?: Class<any>) {
        const value = this.getMetadataByClass(beDecoratedCls);
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
    listFieldKindMetadata(beDecoratedCls: Class<any>, field: Field, findMetadataCls?: Class<any>) {
        const value = this.getMetadataByClass(beDecoratedCls);
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
    listMethodKindMetadata(beDecoratedCls: Class<any>, field: Field, findMetadataCls?: Class<any>) {
        const value = this.getMetadataByClass(beDecoratedCls);
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
     * listClassKindMetadata的递归版本，在类装饰器的元数据类递归，但只返回一个
     * @param beDecoratedCls 被查找的类
     * @param TargetCls 想要匹配的元数据类定义
     * @param levels 递归层数，默认无限制，就是查找所有的装饰器的元数据类，也可以使用数字指定，0表示只查当前装饰器，1表示再查当前装饰器的元数据的装饰器，依次类推
     */
    findClassKindMetadataRecursively(beDecoratedCls: Class<any>, TargetCls: Class<any>, levels: number = Infinity) {
        if (!TargetCls || !this.metaMetadataMap.has(TargetCls)) {
            throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10025, TargetCls?.name ? TargetCls.name : TargetCls)));
        }
        if (levels < 0) {
            return null;
        }
        const classMetadataList = this.listClassKindMetadata(beDecoratedCls);
        if (!classMetadataList) {
            return null;
        }
        const instance = classMetadataList.find((i) => i.constructor === TargetCls);
        if (instance) {
            return instance;
        }
        for (const metadata of classMetadataList) {
            const find = this.findClassKindMetadataRecursively(<Class<any>>metadata.constructor, TargetCls, levels - 1);
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
    listFieldByMetadataCls(beDecoratedCls: Class<any>, MetadataCls: Class<any>): Field[] {
        const def = this.bizMetadataMap.get(beDecoratedCls);
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
    listMethodByMetadataCls(beDecoratedCls: Class<any>, MetadataCls: Class<any>): Field[] {
        const def = this.bizMetadataMap.get(beDecoratedCls);
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
    listBeDecoratedClsByClassKindMetadata(MetadataCls: Class<any>): Map<Class<any>, Metadata> {
        const rlt = new Map<Class<any>, Metadata>();
        for (const [beDecoratedCls, { classMetadata }] of this.bizMetadataMap.entries()) {
            const find = classMetadata.find((i) => i instanceof MetadataCls);
            if (find) {
                rlt.set(beDecoratedCls, find);
            }
        }
        return rlt;
    }
}

export default MetadataRepository;
