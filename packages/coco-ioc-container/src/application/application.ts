import { getComponents, getViewComponent } from '../ioc-container/component-factory';
import {
    Metadata,
    buildMetadata,
    listBeDecoratedClsByClassKindMetadata,
    findClassKindMetadataRecursively,
    listFieldByMetadataCls,
} from '../metadata';
import {
    get,
    clear as clearDecoratorParams,
    replacePlaceholderMetaClassParams2RealMetadataClassParams,
} from '../create-decorator-exp/decorator-exp-param';
import { buildIocComponentDefinition } from '../ioc-container/ioc-component-definition';
import PropertiesConfig from '../properties/properties-config';
import {
    mergePlaceholderClass2RealMetadataClassRelation,
    getPlaceholderClassMap2RealMetadataClass,
} from '../create-decorator-exp/create-decorator-options';

/**
 * 表示一个web应用实例
 * @public
 */
class Application {
    propertiesConfig: PropertiesConfig;

    constructor(jsonConfig: Record<string, any> = {}) {
        this.propertiesConfig = new PropertiesConfig(jsonConfig);
    }

    /**
     * 在项目中，所以的组件都已经收集到coco/index里面了，所以不需要进行组件收集；
     * 在测试时，组件是在执行到对应的行装饰器才会执行，所以需要先收集在启动。
     */
    public start() {
        // 收集field和method装饰器参数
        this.collectFieldOrMethodDecoratorParams();

        {
            // 创建装饰器表达式的渲染中，占位的元数据类替换成真实的元数据类
            mergePlaceholderClass2RealMetadataClassRelation();
            // 收集到的所有的装饰器参数，占位的元数据类替换成真实的元数据类
            replacePlaceholderMetaClassParams2RealMetadataClassParams(getPlaceholderClassMap2RealMetadataClass());
        }

        // 用装饰器参数初始化元数据数据
        buildMetadata(get());

        // 用元数据信息初始化ioc组件数据
        buildIocComponentDefinition();

        // TODO: 不用清空装饰器参数记录
        clearDecoratorParams();

        // 实例化配置启动项的组件
        this.bootComponent();
    }

    /**
     * 根据组件定义返回组件实例，如果存在多个子组件，需要通过qualify指定子组件id
     * @param cls - 类定义
     * @param option
     */
    public getComponent<T>(cls: Class<T>, option?: { qualifier?: string }): T;
    // 根据组件id返回组件实例
    public getComponent<T>(id: string, option?: { qualifier?: string }): T;
    public getComponent<T>(ClsOrId: Class<T> | string, option?: { qualifier?: string }) {
        if (typeof ClsOrId === 'string') {
            // TODO:
            return null;
        } else {
            return getComponents(this, {
                classOrId: ClsOrId,
                qualifier: option?.qualifier,
            });
        }
    }

    /**
     * 仅用于view组件的实例化入口，其他ioc组件都应该使用getComponent
     * @param viewClass view组件的类定义
     * @param props 组件的props
     * @returns
     */
    public getViewComponent<T>(viewClass: Class<T>, props?: any[]) {
        return getViewComponent(this, viewClass, props);
    }

    public listFieldByMetadataCls = listFieldByMetadataCls;
    public findClassKindMetadataRecursively = findClassKindMetadataRecursively;
    public listBeDecoratedClsByClassKindMetadata = listBeDecoratedClsByClassKindMetadata;

    /**
     * 实例化所有业务类（非元数据类），拿到field和method装饰器参数
     */
    private collectFieldOrMethodDecoratorParams() {
        for (const Cls of get().keys()) {
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
    }

    /**
     * 启动所有配置boot的组件
     */
    private bootComponent() {
        // 1. 所有配置boot的组件集合
        const bootComponents = this.propertiesConfig.getAllBootComponents();
        if (bootComponents.length === 0) {
            return;
        }

        // TODO: 支持多个组件初始化
        const bootComponent = bootComponents[0];
        getComponents(this, { classOrId: bootComponent });
    }
}

export default Application;
