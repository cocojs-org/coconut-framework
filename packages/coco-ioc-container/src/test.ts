export * from './index.ts';
import { MetadataRepository } from './metadata/index.ts';
import Metadata, { instantiateMetadata } from './metadata/instantiate-one-metadata.ts';
import { createDecoratorExpFactory } from './create-decorator-exp';
import type Application from './application/application.ts';
import { isEqual } from 'lodash-es';

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
    const classMetadataList = [];
    if (Clazz) {
        const config = application.metadataRepository.getMetadataByClass(Clazz);
        if (config) {
            classMetadataList.push(...config.classMetadata);
        }
    }
    return isEqual(classMetadataList, expectedMetadataList);
}

export { MetadataRepository, checkClassMetadataAsExpected, createDecoratorExpFactory, instantiateMetadata };
