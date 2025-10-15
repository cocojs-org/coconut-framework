export * from './index.ts';
import Metadata, { createMetadata } from './metadata/create-metadata.ts';
import { createDecoratorExpFactory } from './create-decorator-exp/index';

function isEqual(a: unknown, b: unknown) {
    if (typeof a === 'number' || typeof a === 'string' || typeof a === 'boolean' || typeof a === 'undefined') {
        return a === b;
    } else if (Array.isArray(a)) {
        // 浅比较
        if (!Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        for (let i = 0; i < sortedA.length; i++) {
            if (sortedA[i] !== sortedB[i]) {
                return false;
            }
        }
        return true;
    } else {
        throw new Error('未实现的比较');
    }
}

/**
 * 期望特定的类的元信息收集正确的
 * Clazz: 想要校验的类
 * expectedMetadataList: Clazz上应该具备的所有元信息
 */
function checkClassMetadataAsExpected(
    Clazz: Class<any>,
    expectedMetadataList: {
        Metadata: Class<Metadata>;
        fieldValues?: Record<string, any>;
    }[]
) {
    if (!Clazz || expectedMetadataList.length === 0) {
        return false;
    }
    const metadataList = getMetadata(Clazz);
    // 长度不等，元信息肯定不一致
    if (metadataList.length !== expectedMetadataList.length) {
        return false;
    }
    const allExpected = Array.from(expectedMetadataList, (_) => false);
    for (const { metadata } of metadataList) {
        const idx = expectedMetadataList.findIndex((i) => i.Metadata === metadata.constructor);
        if (idx !== -1) {
            let isValueEqual = true;
            const fieldValues = expectedMetadataList[idx].fieldValues;
            if (fieldValues) {
                for (const key of Object.keys(fieldValues)) {
                    if (!isEqual(metadata[key], fieldValues[key])) {
                        isValueEqual = false;
                        break;
                    }
                }
            }
            if (isValueEqual) {
                allExpected[idx] = true;
            }
        }
    }
    return allExpected.every(Boolean);
}

// 检查元数据的元数据是否正确
function checkMetadataForMetadataAsExpected(
    expectedList: {
        metadataCls: Class<Metadata>;
        metaList: {
            Metadata: Class<Metadata>;
            fieldValues?: Record<string, any>;
        }[];
    }[]
) {
    const [metadataForMetadata] = getAllMetadata();
    if (expectedList.length !== metadataForMetadata.size) {
        return false;
    }
    for (const metadata of expectedList) {
        if (!checkClassMetadataAsExpected(metadata.metadataCls, metadata.metaList)) {
            return false;
        }
    }
    return true;
}

import {
    addClassMetadata,
    addFieldMetadata,
    getMetadata,
    getAllMetadata,
    listClassMetadata,
    listFieldMetadata,
    findClassMetadata,
    listBeDecoratedClsByClassMetadata,
    listBeDecoratedClsByFieldMetadata,
    clear as clearMetadata,
} from './metadata/index.ts';
import { clear as clearComponentFactory } from './ioc-container/component-factory';
import { clear as clearComponentDefinition } from './ioc-container/ioc-component-definition';
import { clear as clearPreventCircularDependency } from 'shared';

function clear() {
    clearMetadata();
    clearComponentFactory();
    clearComponentDefinition();
    clearPreventCircularDependency();
}

export {
    checkClassMetadataAsExpected,
    createDecoratorExpFactory,
    createMetadata,
    addClassMetadata,
    addFieldMetadata,
    getAllMetadata,
    listClassMetadata,
    listFieldMetadata,
    findClassMetadata,
    listBeDecoratedClsByClassMetadata,
    listBeDecoratedClsByFieldMetadata,
    clearMetadata,
};
