/**
 * 元数据类模块的工作流
 */
import { type Params } from '../create-decorator-exp/decorator-exp-param';
import { KindClass, KindField, KindMethod } from '../create-decorator-exp/decorator-context';
import {
    addClassKindMetadata,
    addFieldKindMetadata,
    addMethodKindMetadata,
    getAllMetadata,
    clearAllMetadata,
} from './class-metadata';
import validate from './validate';
import IdClassMap from './id-class-map';
import { printDiagnose, type Diagnose } from 'shared';

// 使用装饰器参数生成对应的元数据实例
function createMetadataByDecoratorParam(decoratorMap: Map<Class<any>, Params[]>) {
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
                    addClassKindMetadata(beDecoratedCls, metadataClass, metadataParam);
                    break;
                case KindField:
                    addFieldKindMetadata(beDecoratedCls, field, metadataClass, metadataParam);
                    break;
                case KindMethod:
                    addMethodKindMetadata(beDecoratedCls, field, metadataClass, metadataParam);
                    break;
            }
        }
    }
}

/**
 * 元数据相关数据的初始化
 * @param decoratorMap 收集到的所有装饰器参数
 */
function initMetadataModule(decoratorMap: Map<Class<any>, Params[]>) {
    createMetadataByDecoratorParam(decoratorMap);
    // TODO: 校验全部放在core里面做到，然后业务上获取的时候先过滤掉非法的元数据，只从合法的元数据中查找
    const [metadataMap, bizMap] = getAllMetadata();
    const diagnoseList: Diagnose[] = validate([metadataMap, bizMap]);
    if (diagnoseList.length > 0) {
        diagnoseList.forEach(printDiagnose);
    }
    const idClassMap = new IdClassMap(metadataMap);
    return idClassMap;
}

// 元数据相关数据清理
function clearMetadataModule(idClassMap: IdClassMap) {
    clearAllMetadata();
    idClassMap.destructor();
}

export { initMetadataModule, clearMetadataModule };
