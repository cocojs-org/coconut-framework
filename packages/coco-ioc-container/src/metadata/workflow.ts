/**
 * 元数据类模块的工作流
 */
import { type Params } from '../create-decorator-exp/decorator-exp-param';
import ClassMetadata from './class-metadata';
import validate from './validate';
import IdClassMap from './id-class-map';
import { printDiagnose, type Diagnose } from 'shared';

/**
 * 元数据相关数据的初始化
 * @param decoratorMap 收集到的所有装饰器参数
 */
function initMetadataModule(decoratorMap: Map<Class<any>, Params[]>) {
    const classMetadata = new ClassMetadata(decoratorMap);
    // TODO: 校验全部放在core里面做到，然后业务上获取的时候先过滤掉非法的元数据，只从合法的元数据中查找
    const [metadataMap, bizMap] = classMetadata.getAll();
    const diagnoseList: Diagnose[] = validate([metadataMap, bizMap]);
    if (diagnoseList.length > 0) {
        diagnoseList.forEach(printDiagnose);
    }
    const idClassMap = new IdClassMap(metadataMap);
    return { classMetadata, idClassMap };
}

// 元数据相关数据清理
function clearMetadataModule(classMetadata: ClassMetadata, idClassMap: IdClassMap) {
    if (classMetadata) {
        classMetadata.destructor();
    }
    if (idClassMap) {
        idClassMap.destructor();
    }
}

export { initMetadataModule, clearMetadataModule };
