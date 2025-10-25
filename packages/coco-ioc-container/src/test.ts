export * from './index.ts';
import { ClassMetadata } from './metadata/index.ts';
import Metadata, { instantiateMetadata } from './metadata/instantiate-one-metadata.ts';
import { createDecoratorExpFactory } from './create-decorator-exp/index';
import type Application from './application/application.ts';

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
 * 获取被装饰器类的类元信息
 */
function getClassMetadata(application: Application, beDecoratedCls?: Class<any>) {
    if (beDecoratedCls) {
        const config = application.classMetadata.getMetadataByClass(beDecoratedCls);
        if (config) {
            return config.classMetadata;
        }
    }
    return [];
}

/**
 * 期望被装饰的类的类元信息收集正确的
 * Clazz: 想要校验的类
 * expectedMetadataList: Clazz上应该具备的所有元信息
 */
function checkClassMetadataAsExpected(
    application: Application,
    Clazz: Class<any>,
    expectedMetadataList: {
        Metadata: Class<Metadata>;
        fieldValues?: Record<string, any>;
    }[]
) {
    if (!Clazz || expectedMetadataList.length === 0) {
        return false;
    }
    const classMetadataList = getClassMetadata(application, Clazz);
    // 长度不等，元信息肯定不一致
    if (classMetadataList.length !== expectedMetadataList.length) {
        return false;
    }
    const allExpected = Array.from(expectedMetadataList, (_) => false);
    for (const metadata of classMetadataList) {
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

export { ClassMetadata, checkClassMetadataAsExpected, createDecoratorExpFactory, instantiateMetadata };
