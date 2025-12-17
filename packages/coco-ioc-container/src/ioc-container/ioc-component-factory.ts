import { type IocComDef } from './ioc-component-definition';
import type Application from '../application';
import { getCreateDecoratorOption } from '../create-decorator-exp/create-decorator-options';
import ConstructorParam from '../decorator/metadata/constructor-param';
import Autowired from '../decorator/metadata/autowired';
import { createDiagnose, DiagnoseCode, printDiagnose, stringifyDiagnose } from 'shared';
import Qualifier from '../decorator/metadata/qualifier';

type ConstructOption = {
    classOrId: Class<any> | string;
    qualifier?: string;
};

class IocComponentFactory {
    // 单例构造函数和单例的映射关系
    singletonInstances: Map<Class<any>, any> = new Map();

    private createComponent<T>(application: Application, definition: IocComDef<T>, constructorArgs: any[]): T {
        const { cls, instantiateType } = definition;
        let component;
        if (instantiateType === 'new') {
            component = new cls(...constructorArgs);
        } else {
            const { configurationCls, method } = definition.methodInstantiateOpts;
            const configuration = new configurationCls();
            component = configuration[method]();
        }
        const metadatas = application.metadataRepository.getMetadataByClass(cls);
        if (metadatas) {
            const { classMetadata, methodMetadata, fieldMetadata } = metadatas;
            for (const meta of classMetadata) {
                const option = getCreateDecoratorOption(meta.constructor as Class<any>);
                if (option) {
                    option.componentPostConstruct.call(component, meta, application);
                }
            }
            for (const [field, metaList] of fieldMetadata.entries()) {
                for (const meta of metaList) {
                    const option = getCreateDecoratorOption(meta.constructor as Class<any>);
                    if (option) {
                        option.componentPostConstruct.call(component, meta, application, field);
                    }
                }
            }
            for (const [method, metaList] of methodMetadata.entries()) {
                for (const meta of metaList) {
                    const option = getCreateDecoratorOption(meta.constructor as Class<any>);
                    if (option) {
                        option.componentPostConstruct.call(component, meta, application, method);
                    }
                }
            }
        }
        return component;
    }

    getComponents(application: Application, userOption: ConstructOption) {
        const targetClsInstanceMap = new Map<Class<any>, any>(); // 想要实例化的类和对应的实例
        const instanceInstantiateClsMap = new Map<any, Class<any>>(); // 新建实例和对应的实例化类
        const newSingletonInstances: Map<Class<any>, any> = new Map(); // 新增的单例，最后要合并到singletonInstances
        const instantiatingStage = new Set<Class<any>>(); // 实例化中
        const assignningStage = new Set<Class<any>>(); // field赋值中
        const finishedStage = new Set<Class<any>>(); // 已完成

        // 已经有的单例填充到finishedStage和instances
        for (const [cls, instance] of this.singletonInstances.entries()) {
            targetClsInstanceMap.set(cls, instance);
        }

        // 完整的初始化一个组件
        const instantiateComponent = (opt: ConstructOption) => {
            const { classOrId } = opt;

            // 要实例化的类定义
            const targetDefinition = application.iocComponentDefinition.getDefinition(classOrId);
            if (!targetDefinition) {
                const diagnose = createDiagnose(
                    DiagnoseCode.CO10011,
                    typeof classOrId === 'string' ? classOrId : classOrId.name
                );
                throw new Error(stringifyDiagnose(diagnose));
            }
            let qualifier = opt.qualifier;
            if (!qualifier) {
                // 如果没有指定，尝试从配置中获取
                qualifier = application.propertiesConfig.getValue(`${targetDefinition.id}.qualifier`);
            }
            // 真正实例化的类定义
            const instantiateDefinition = application.iocComponentDefinition.getInstantiateDefinition(
                classOrId,
                qualifier
            );

            if (instantiateDefinition.isSingleton) {
                if (this.singletonInstances.has(instantiateDefinition.cls)) {
                    return this.singletonInstances.get(instantiateDefinition.cls);
                } else if (newSingletonInstances.has(instantiateDefinition.cls)) {
                    return newSingletonInstances.get(instantiateDefinition.cls);
                }
            }
            if (instantiatingStage.has(targetDefinition.cls)) {
                // 理论上不可能走到这里
                throw new Error(`循环依赖: ${targetDefinition.cls.name}`);
            }
            // 在实例化中或者已实例化，返回实例
            if (assignningStage.has(targetDefinition.cls) || finishedStage.has(targetDefinition.cls)) {
                return targetClsInstanceMap.get(targetDefinition.cls);
            }
            instantiatingStage.add(targetDefinition.cls);

            const constructorArgs = [];
            const constructorParams = application.metadataRepository.listClassKindMetadata(
                instantiateDefinition.cls,
                ConstructorParam
            );
            if (constructorParams.length > 0) {
                // 因为元数据不能重复，所以只有一个
                const constructorParamsParams = (constructorParams[0] as ConstructorParam).value;
                for (const dependency of constructorParamsParams) {
                    if (dependency === undefined) {
                        constructorArgs.push(undefined);
                    } else {
                        const depInstance = instantiateComponent({
                            classOrId: dependency,
                        });
                        // 确保依赖已完全注入
                        if (!finishedStage.has(dependency) && !this.singletonInstances.has(dependency)) {
                            const diagnose = createDiagnose(
                                DiagnoseCode.CO10013,
                                targetDefinition.cls.name,
                                dependency.name
                            );
                            throw new Error(stringifyDiagnose(diagnose));
                        }
                        constructorArgs.push(depInstance);
                    }
                }
            }

            // 2. 实例化，同时执行componentPostConstruct
            const instance = this.createComponent(application, instantiateDefinition, constructorArgs);
            if (instantiateDefinition.isSingleton) {
                newSingletonInstances.set(instantiateDefinition.cls, instance);
            }
            targetClsInstanceMap.set(targetDefinition.cls, instance);
            instanceInstantiateClsMap.set(instance, instantiateDefinition.cls);
            instantiatingStage.delete(targetDefinition.cls);
            assignningStage.add(targetDefinition.cls);

            // 3. 递归实例化field注入
            const autowiredFields = application.metadataRepository.listFieldByMetadataCls(
                instantiateDefinition.cls,
                Autowired
            );
            for (const field of autowiredFields) {
                const autowiredMetadatas = application.metadataRepository.listFieldKindMetadata(
                    instantiateDefinition.cls,
                    field,
                    Autowired
                ) as Autowired[];
                if (autowiredMetadatas.length > 0) {
                    const autowiredCls = autowiredMetadatas[0].value;
                    if (autowiredCls === undefined) {
                        instance[field] = undefined;
                    } else if (autowiredCls === instantiateDefinition.cls) {
                        // 检查自依赖：不能注入自己
                        // TODO: 如果autowiredCls是instantiateDefinition.cls的祖先类或者子孙类怎么办？
                        const diagnose = createDiagnose(DiagnoseCode.CO10012, instantiateDefinition.cls.name, field);
                        printDiagnose(diagnose);
                        instance[field] = undefined;
                    } else {
                        const qualifierMetadatas = application.metadataRepository.listFieldKindMetadata(
                            instantiateDefinition.cls,
                            field,
                            Qualifier
                        ) as Qualifier[];
                        let qualifier: string;
                        if (qualifierMetadatas.length > 0) {
                            qualifier = qualifierMetadatas[0].value;
                        }
                        const autowiredInstance = instantiateComponent({
                            classOrId: autowiredCls,
                            qualifier,
                        });
                        instance[field] = autowiredInstance;
                    }
                }
            }

            // 4. 标记为完全注入
            assignningStage.delete(targetDefinition.cls);
            finishedStage.add(targetDefinition.cls);

            return instance;
        };

        // TODO: 如果初始化多个，有没有先后顺序问题？
        const instance = instantiateComponent(userOption);
        // merge newSingletonInstances to singletonInstances
        if (newSingletonInstances.size > 0) {
            for (const [cls, instance] of newSingletonInstances.entries()) {
                this.singletonInstances.set(cls, instance);
                // 现在默认子类的singleton和父类都是保持一致的。TODO: 如果子类的singleton不是单例了，应该如何处理
            }
        }

        // 5. 所有新增的单例执行init方法
        for (const cls of finishedStage.keys()) {
            // 这里应该是根据instance来判断是否已经存在的
            const instance = targetClsInstanceMap.get(cls);
            if (typeof instance['init'] === 'function') {
                instance['init']?.call(instance, application);
            }
        }

        // 执行start方法
        for (const cls of finishedStage.keys()) {
            const instance = targetClsInstanceMap.get(cls);
            if (typeof instance['start'] === 'function') {
                instance['start']?.call(instance, application);
            }
        }

        return instance;
    }

    getViewComponent(application: Application, viewClass: Class<any>, props: any[]) {
        const targetDefinition = application.iocComponentDefinition.getDefinition(viewClass);
        if (!targetDefinition) {
            const diagnose = createDiagnose(
                DiagnoseCode.CO10011,
                typeof viewClass === 'string' ? viewClass : viewClass.name
            );
            throw new Error(stringifyDiagnose(diagnose));
        }
        // 视图组件目前简单的认为全是prototype，且不支持实例化子组件
        const instance = this.createComponent(application, targetDefinition, [props]);
        const autowiredFields = application.metadataRepository.listFieldByMetadataCls(targetDefinition.cls, Autowired);
        for (const field of autowiredFields) {
            const autowiredMetadatas = application.metadataRepository.listFieldKindMetadata(
                targetDefinition.cls,
                field,
                Autowired
            ) as Autowired[];
            if (autowiredMetadatas.length > 0) {
                const autowiredCls = autowiredMetadatas[0].value;
                if (autowiredCls === undefined) {
                    instance[field] = undefined;
                } else if (autowiredCls === targetDefinition.cls) {
                    // 检查自依赖：不能注入自己
                    // TODO: 如果autowiredCls是instantiateDefinition.cls的祖先类或者子孙类怎么办？
                    const diagnose = createDiagnose(DiagnoseCode.CO10012, targetDefinition.cls.name, field);
                    printDiagnose(diagnose);
                    instance[field] = undefined;
                } else {
                    const qualifierMetadatas = application.metadataRepository.listFieldKindMetadata(
                        targetDefinition.cls,
                        field,
                        Qualifier
                    ) as Qualifier[];
                    let qualifier: string;
                    if (qualifierMetadatas.length > 0) {
                        qualifier = qualifierMetadatas[0].value;
                    }
                    const autowiredInstance = this.getComponents(application, {
                        classOrId: autowiredCls,
                        qualifier,
                    });
                    instance[field] = autowiredInstance;
                }
            }
        }
        return instance;
    }

    destructor() {
        // TODO: 调用组件的destroy方法
        this.singletonInstances.clear();
    }
}

export default IocComponentFactory;
