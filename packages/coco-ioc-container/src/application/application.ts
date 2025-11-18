import { getComponents, getViewComponent } from '../ioc-container/component-factory';
import { initMetadataModule, clearMetadataModule, type Metadata, type MetadataRepository } from '../metadata';
import { getDecoratorParam, initDecoratorParamModule, clearDecoratorParamModule } from '../create-decorator-exp';
import { initIocComponentDefinitionModule, clearIocComponentDefinitionModule } from '../ioc-container/workflow';
import PropertiesConfig from '../properties/properties-config';
import type IdClassMap from '../metadata/id-class-map';
import type ComponentMetadataClass from '../metadata/component-metadata-class.ts';
import type IocComponent from '../ioc-container/ioc-component-definition.ts';

/**
 * 表示一个web应用实例
 * @public
 */
class Application {
    componentMetadataClass: ComponentMetadataClass;
    metadataRepository: MetadataRepository;
    idClassMap: IdClassMap;
    propertiesConfig: PropertiesConfig;
    iocComponent: IocComponent;

    constructor(jsonConfig: Record<string, any> = {}) {
        this.propertiesConfig = new PropertiesConfig(jsonConfig);
    }

    /**
     * 在项目中，所以的组件都已经收集到coco/index里面了，所以不需要进行组件收集；
     * 在测试时，组件是在执行到对应的行装饰器才会执行，所以需要先收集在启动。
     */
    public start() {
        initDecoratorParamModule();

        // 用装饰器参数初始化元数据数据
        const { metadataRepository, idClassMap, componentMetadataClass } = initMetadataModule(getDecoratorParam());
        this.metadataRepository = metadataRepository;
        this.idClassMap = idClassMap;
        this.componentMetadataClass = componentMetadataClass;

        // 用元数据信息初始化ioc组件数据
        this.iocComponent = initIocComponentDefinitionModule(this.metadataRepository, this.componentMetadataClass);

        // 实例化配置启动项的组件
        this.bootComponent();
    }

    public destructor() {
        clearIocComponentDefinitionModule(this.iocComponent);
        clearMetadataModule(this.metadataRepository, this.idClassMap, this.componentMetadataClass);
        clearDecoratorParamModule();
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

    public listFieldByMetadataCls(beDecoratedCls: Class<any>, MetadataCls: Class<any>) {
        return this.metadataRepository.listFieldByMetadataCls(beDecoratedCls, MetadataCls);
    }
    public findClassKindMetadataRecursively(beDecoratedCls: Class<any>, TargetCls: Class<any>, upward: number = 0) {
        return this.metadataRepository.findClassKindMetadataRecursively(beDecoratedCls, TargetCls, upward);
    }
    public listBeDecoratedClsByClassKindMetadata(MetadataCls: Class<any>) {
        return this.metadataRepository.listBeDecoratedClsByClassKindMetadata(MetadataCls);
    }
    public getMetaClassById(id: string) {
        return this.idClassMap.getMetaClassById(id);
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
