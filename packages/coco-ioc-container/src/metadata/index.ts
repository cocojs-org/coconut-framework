import { Diagnose, printDiagnose } from 'shared';
import { KindClass, KindField, KindMethod } from '../create-decorator-exp';
import { type Params } from '../create-decorator-exp/decorator-exp-param';
import {
  type BizMetadata,
  type MetaMetadata,
  addClassMetadata,
  addFieldMetadata,
  addMethodMetadata,
  clear,
  findClassMetadata,
  getAllMetadata,
  getMetadata,
  getFromMap,
  listBeDecoratedClsByClassMetadata,
  listBeDecoratedClsByFieldMetadata,
  listClassMetadata,
  listFieldByMetadataCls,
  listFieldMetadata,
  listMethodByMetadataCls,
  listMethodMetadata,
} from './all-metadata';
import Metadata from './create-metadata';
import validate from './validate';
import { buildMetaClassIdMap, getMetaClassById, defineMetadataId } from './id';

// 使用装饰器参数生成对应的元数据实例
function createMetadataByDecoratorParam(
  decoratorMap: Map<Class<any>, Params[]>
) {
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
          addClassMetadata(beDecoratedCls, metadataClass, metadataParam);
          break;
        case KindField:
          addFieldMetadata(beDecoratedCls, field, metadataClass, metadataParam);
          break;
        case KindMethod:
          addMethodMetadata(
            beDecoratedCls,
            field,
            metadataClass,
            metadataParam
          );
          break;
      }
    }
  }
}

/**
 * 构建元数据信息，为运行时做准备
 * @param decoratorMap 收集到的所有装饰器参数
 */
function buildMetadata(decoratorMap: Map<Class<any>, Params[]>) {
  createMetadataByDecoratorParam(decoratorMap);
  // TODO: 校验全部放在core里面做到，然后业务上获取的时候先过滤掉非法的元数据，只从合法的元数据中查找
  const [metadataMap, bizMap] = getAllMetadata();
  const diagnoseList: Diagnose[] = validate([metadataMap, bizMap]);
  if (diagnoseList.length > 0) {
    diagnoseList.forEach(printDiagnose);
  }
  buildMetaClassIdMap(metadataMap);
}

export {
  type MetaMetadata,
  type BizMetadata,
  getMetaClassById,
  addClassMetadata,
  addFieldMetadata,
  addMethodMetadata,
  listClassMetadata,
  listFieldMetadata,
  listMethodMetadata,
  findClassMetadata,
  listFieldByMetadataCls,
  listMethodByMetadataCls,
  listBeDecoratedClsByClassMetadata,
  listBeDecoratedClsByFieldMetadata,
  clear,
  getFromMap,
  getMetadata,
  getAllMetadata,
  buildMetadata,
  Metadata,
  defineMetadataId,
};
