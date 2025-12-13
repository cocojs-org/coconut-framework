/**
 * 元数据类模块的工作流
 */
import { type Params } from '../create-decorator-exp/decorator-exp-param';
import MetadataRepository from './metadata-repository';
import validate from './validate';
import CocoidClassMap from './cocoid-class-map';
import { printDiagnose, type Diagnose } from 'shared';
import ComponentMetadataClass from './component-metadata-class';

/**
 * 元数据相关数据的初始化
 * @param decoratorMap 收集到的所有装饰器参数
 */
function initMetadataModule(decoratorMap: Map<Class<any>, Params[]>) {
    const metadataRepository = new MetadataRepository(decoratorMap);
    const componentMetadataClass = new ComponentMetadataClass();
    // TODO: 校验全部放在core里面做到，然后业务上获取的时候先过滤掉非法的元数据，只从合法的元数据中查找
    const [metadataMap, bizMap] = metadataRepository.getAll();
    const diagnoseList: Diagnose[] = validate([metadataMap, bizMap], componentMetadataClass);
    if (diagnoseList.length > 0) {
        diagnoseList.forEach(printDiagnose);
    }
    const cocoidClassMap = new CocoidClassMap(metadataMap);
    return { metadataRepository, cocoidClassMap, componentMetadataClass };
}

// 元数据相关数据清理
function clearMetadataModule(
    metadataRepository: MetadataRepository,
    cocoidClassMap: CocoidClassMap,
    componentMetadataClass: ComponentMetadataClass
) {
    if (metadataRepository) {
        metadataRepository.destructor();
    }
    if (cocoidClassMap) {
        cocoidClassMap.destructor();
    }
    if (componentMetadataClass) {
        componentMetadataClass.destructor();
    }
}

export { initMetadataModule, clearMetadataModule };
