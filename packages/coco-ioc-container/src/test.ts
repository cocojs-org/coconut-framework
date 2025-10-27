export * from './index.ts';
import { ClassMetadata } from './metadata/index.ts';
import Metadata, { instantiateMetadata } from './metadata/instantiate-one-metadata.ts';
import { createDecoratorExpFactory } from './create-decorator-exp/index';
import type Application from './application/application.ts';
import _ from 'lodash';

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
        const config = application.classMetadata.getMetadataByClass(Clazz);
        if (config) {
            classMetadataList.push(...config.classMetadata);
        }
    }
    return _.isEqual(classMetadataList, expectedMetadataList);
}

export { ClassMetadata, checkClassMetadataAsExpected, createDecoratorExpFactory, instantiateMetadata };
