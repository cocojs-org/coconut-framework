/**
 * 装饰器表达式模块的工作流
 */
import Metadata from '../metadata/instantiate-one-metadata';
import {
    getPlaceholderClassMap2RealMetadataClass,
    mergePlaceholderClass2RealMetadataClassRelation,
    clear as clearCreateDecoratorOptions,
} from './create-decorator-options';
import {
    getDecoratorParam,
    replacePlaceholderMetaClassParams2RealMetadataClassParams,
    clear as clearDecoratorParam,
} from './decorator-exp-param';

function initDecoratorParamModule() {
    // 收集field和method装饰器参数
    for (const Cls of getDecoratorParam().keys()) {
        if (Object.getPrototypeOf(Cls) !== Metadata) {
            /**
             * TODO: 如果view组件的state需要用到props初始化的话，会导致报错，例如：
             * class {
             *   constructor(props){
             *     this.name = props.name // 这里会报错
             *   }
             * }
             */
            new Cls();
        }
    }

    // 创建的装饰器表达式的选项，将占位的元数据类替换成真实的元数据类
    mergePlaceholderClass2RealMetadataClassRelation();
    // 收集到的所有的装饰器参数，占位的元数据类替换成真实的元数据类
    replacePlaceholderMetaClassParams2RealMetadataClassParams(getPlaceholderClassMap2RealMetadataClass());
}

function clearDecoratorParamModule() {
    clearCreateDecoratorOptions();
    clearDecoratorParam();
}

export { initDecoratorParamModule, clearDecoratorParamModule };
