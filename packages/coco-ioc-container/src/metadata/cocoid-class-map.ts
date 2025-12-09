/**
 * 元数据类id和元数据类的映射
 * 每个元数据类都有一个id属性，主要目的是通过id获取元数据类本身：
 * 1. 每个元数据类的id都是唯一的
 * 2. id默认由元数据类的name而来，TODO:在构建配置中可以配置当前应用或类库的id的公共前缀，解决冲突问题
 */

import { createDiagnose, DiagnoseCode, printDiagnose, stringifyDiagnose } from 'shared';
import Metadata from './instantiate-one-metadata';
import { type MetaMetadata } from './metadata-repository';

class CocoidClassMap {
    private cocoidClassMap: Map<string, Class<Metadata>> = new Map();

    /**
     * * 保存元数据类本身，方便运行是通过id获取元数据类
     * * @param metaMetadataMap 元数据类映射map，key是元数据类，value是元数据类的元数据列表
     */
    constructor(metaMetadataMap: Map<Class<Metadata>, MetaMetadata>) {
        for (const cls of metaMetadataMap.keys()) {
            const cocoId = cls.$$cocoId;
            if (typeof cocoId !== 'string' || !cocoId.trim()) {
                throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10016, cls.name)));
            }
            if (this.cocoidClassMap.has(cocoId)) {
                throw new Error(stringifyDiagnose(createDiagnose(DiagnoseCode.CO10017, cls, this.cocoidClassMap.get(cocoId))));
            }
            this.cocoidClassMap.set(cocoId, cls);
        }
    }

    /**
     * * 根据cocoId获取元数据类
     * * @param cocoId 元数据类id
     * * @returns 元数据类
     */
    getMetaClassById(cocoId: string) {
        if (typeof cocoId !== 'string' || !cocoId.trim() || !this.cocoidClassMap.has(cocoId)) {
            return null;
        } else {
            return this.cocoidClassMap.get(cocoId);
        }
    }

    destructor() {
        this.cocoidClassMap.clear();
    }
}

export default CocoidClassMap;
