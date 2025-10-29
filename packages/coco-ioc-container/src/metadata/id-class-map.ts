/**
 * 元数据类id和元数据类的映射
 * 每个元数据类都有一个id属性，主要目的是通过id获取元数据类本身：
 * 1. 每个元数据类的id都是唯一的
 * 2. id默认由元数据类的name而来，TODO:在构建配置中可以配置当前应用或类库的id的公共前缀，解决冲突问题
 */

import { createDiagnose, DiagnoseCode, printDiagnose, stringifyDiagnose } from 'shared';
import Metadata from './instantiate-one-metadata';
import { type MetaMetadata } from './metadata-repository';
import Id from '../decorator/metadata/id';

class IdClassMap {
    private idClassMap: Map<string, Metadata> = new Map();

    /**
     * * 保存元数据类本身，方便运行是通过id获取元数据类
     * * @param metaMetadataMap 元数据类映射map，key是元数据类，value是元数据类的元数据列表
     */
    constructor(metaMetadataMap: Map<Class<Metadata>, MetaMetadata>) {
        for (const [cls, metadataList] of metaMetadataMap.entries()) {
            const idMetadata = metadataList.classMetadata.find((m) => m.constructor === Id) as Id | undefined;
            const id = idMetadata ? idMetadata.value : cls.name; // 如果用户没有显式设置id，则使用类名作为id
            if (typeof id !== 'string' || !id) {
                throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10016, cls.name)));
            }
            if (this.idClassMap.has(id)) {
                throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10017, cls, this.idClassMap.get(id))));
            }
            this.idClassMap.set(id, cls);
        }
    }

    /**
     * * 根据id获取元数据类
     * * @param id 元数据类id
     * * @returns 元数据类
     */
    getMetaClassById(id: string) {
        if (typeof id !== 'string' || !id.trim() || !this.idClassMap.has(id)) {
            return null;
        } else {
            return this.idClassMap.get(id);
        }
    }

    destructor() {
        this.idClassMap.clear();
    }
}

export default IdClassMap;
