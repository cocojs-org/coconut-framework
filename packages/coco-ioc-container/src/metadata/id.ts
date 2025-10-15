/**
 * 元数据的类的id
 * 每个元数据类都有一个id属性，主要目的是通过id获取元数据类本身：
 * 1. 每个元数据类的id都是唯一的
 * 2. id默认由元数据类的name而来，TODO:在构建配置中可以配置当前应用或类库的id的公共前缀，解决冲突问题
 */

import { createDiagnose, DiagnoseCode, printDiagnose, stringifyDiagnose } from 'shared';
import Metadata from './create-metadata';
import { MetaMetadata } from './all-metadata';

// 元数据类本身和自身id的映射
const idMetadataClassMap: Map<string, Metadata> = new Map();

/**
 * 为元数据类添加id
 * @param MetadataClass 元数据类
 * @param prefix id的前缀，用于区分不同的应用或类库，避免冲突
 */
function defineMetadataId(MetadataClass: Class<any>, prefix: string = ''): void {
    const descriptor = Object.getOwnPropertyDescriptor(MetadataClass, 'id');
    if (descriptor) {
        if (descriptor.writable) {
            console.error(`框架会在类的上添加id属性，${MetadataClass.name} 原本的id属性会被覆盖`);
        } else {
            throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10015, MetadataClass.name)));
        }
    }
    Object.defineProperty(MetadataClass, 'id', {
        value: prefix + MetadataClass.name,
        enumerable: false,
        configurable: false,
        writable: false,
    });
}

/**
 * 保存元数据类本身，方便运行时被调用
 */
function buildMetaClassIdMap(metaMetadataMap: Map<Class<Metadata>, MetaMetadata>) {
    for (const cls of metaMetadataMap.keys()) {
        const id: any = cls['id'];
        if (typeof id !== 'string' || !id) {
            throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10016, cls.name)));
        }
        if (idMetadataClassMap.has(id)) {
            throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10017, cls, idMetadataClassMap.get(id))));
        }
        idMetadataClassMap.set(id, cls);
    }
}

function getMetaClassById(id: string) {
    if (typeof id !== 'string' || !id.trim() || !idMetadataClassMap.has(id)) {
        return null;
    } else {
        return idMetadataClassMap.get(id);
    }
}

export { defineMetadataId, buildMetaClassIdMap, getMetaClassById };
