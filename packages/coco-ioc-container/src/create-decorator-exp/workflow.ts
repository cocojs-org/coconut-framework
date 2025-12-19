/**
 * 装饰器表达式模块的工作流
 */
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
import { isCocoClass } from '../share/util.ts';

function initDecoratorParamModule() {
    // 收集field和method装饰器参数
    for (const Cls of getDecoratorParam().keys()) {
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

    // 创建的装饰器表达式的选项，将占位的元数据类替换成真实的元数据类
    mergePlaceholderClass2RealMetadataClassRelation();
    // 收集到的所有的装饰器参数，占位的元数据类替换成真实的元数据类
    replacePlaceholderMetaClassParams2RealMetadataClassParams(getPlaceholderClassMap2RealMetadataClass());

    // 所有的被装饰类都要符合一定的要求
    for (const beDecoratedClass of getDecoratorParam().keys()) {
        if (!isCocoClass(beDecoratedClass)) {
            throw new Error(`所有被装饰器的对象${beDecoratedClass?.name}必须都是类或者类字段或类方法，且必须存在静态$$id字段。`)
        }
    }
}

function clearDecoratorParamModule() {
    clearCreateDecoratorOptions();
    clearDecoratorParam();
}

export { initDecoratorParamModule, clearDecoratorParamModule };
