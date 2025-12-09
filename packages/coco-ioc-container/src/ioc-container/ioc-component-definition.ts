import { isDescendantOf, uppercaseFirstLetter } from '../share/util';
import { createDiagnose, DiagnoseCode, stringifyDiagnose } from 'shared';

/**
 * 所有被扫描的规范的组件
 * 包括：
 * 1. 项目中添加@component类装饰的组件
 * 2. 第三方添加@component类装饰的组件
 * 3. 项目中通过@component方法装饰注册的组件
 */
export interface IocComDef<T> {
    // cocoid，每个组件的id是唯一的
    cocoid: string;

    cls: Class<T>;

    // 是否是单例模式，不是的话每次实例化都会创建一个新的实例
    isSingleton: boolean;

    // 实例化方式
    instantiateType: 'new' | 'method';
    // 当实例化方式为method时对应的选项
    methodInstantiateOpts?: {
        configurationCls: Class<any>; // 配置类
        method: string; // 方法名
    };
}
export type Id = string;

class IocComponentDefinition {
    idDefinitionMap: Map<Id, IocComDef<any>> = new Map();
    clsDefinitionMap: Map<Class<any>, IocComDef<any>> = new Map();

    newIocComponentDefinition<T>(
        cocoid: string,
        cls: Class<T>,
        isSingleton: boolean,
        instantiateType: 'new' | 'method'
    ): IocComDef<T> {
        return { cocoid, cls, isSingleton, instantiateType };
    }

    addDefinition(
        cls: Class<any>,
        cocoid: string,
        isSingleton: boolean,
        methodInstantiateOpts?: { configurationCls: Class<any>; method: string }
    ) {
        const existClsDef = this.clsDefinitionMap.get(cls);
        if (existClsDef) {
            throw new Error(`存在同名的组件: [${existClsDef.cls.name}] - [${cls.name}]`);
        }
        if (typeof cocoid !== 'string' || !cocoid.trim()) {
            throw new Error(`生成组件id失败: [${cls.name}]`);
        }
        const existIdDef = this.idDefinitionMap.get(cocoid);
        if (existIdDef) {
            throw new Error(`存在cocoid的组件: [${existIdDef.cls.name}] - [${cls.name}]`);
        }
        const componentDefinition = this.newIocComponentDefinition(
            cocoid,
            cls,
            isSingleton,
            methodInstantiateOpts ? 'method' : 'new'
        );
        if (methodInstantiateOpts) {
            componentDefinition.methodInstantiateOpts = methodInstantiateOpts;
        }
        this.idDefinitionMap.set(cocoid, componentDefinition);
        this.clsDefinitionMap.set(cls, componentDefinition);
    }

    /**
     * 获取真正会实例化的类定义
     * @param ClsOrId 想要实例化的类或类id
     * @param qualifier 如果存在多个后端类，需要通过qualifier指定具体的类id
     * @returns 真正会实例化的类定义
     */
    getInstantiateDefinition(ClsOrId: Class<any> | Id, qualifier?: string) {
        const definition = this.getDefinition(ClsOrId);
        if (!definition) {
            const diagnose = createDiagnose(DiagnoseCode.CO10011, typeof ClsOrId === 'string' ? ClsOrId : ClsOrId.name);
            throw new Error(stringifyDiagnose(diagnose));
        }
        const descendantList: Class<any>[] = Array.from(this.clsDefinitionMap.keys()).filter((i) =>
            isDescendantOf(i, definition.cls)
        );
        if (descendantList.length === 0) {
            // 没有子组件直接返回本身
            return definition;
        } else if (descendantList.length === 1) {
            // 有一个子组件
            return this.clsDefinitionMap.get(descendantList[0]);
        } else {
            // 多个子组件
            if (qualifier) {
                for (const child of descendantList) {
                    const def = this.clsDefinitionMap.get(child);
                    if (def.cocoid === qualifier) {
                        return def;
                    }
                }
            }
            if (qualifier) {
                const diagnose = createDiagnose(
                    DiagnoseCode.CO10010,
                    definition.cocoid,
                    descendantList.map((i) => i.name),
                    qualifier
                );
                throw new Error(stringifyDiagnose(diagnose));
            } else {
                const diagnose = createDiagnose(
                    DiagnoseCode.CO10009,
                    definition.cocoid,
                    descendantList.map((i) => i.name)
                );
                throw new Error(stringifyDiagnose(diagnose));
            }
        }
    }

    getDefinition(ClsOrId: Class<any> | Id) {
        if (typeof ClsOrId === 'string') {
            return this.idDefinitionMap.get(ClsOrId);
        } else {
            return this.clsDefinitionMap.get(ClsOrId);
        }
    }

    existDefinition(ClsOrId: Class<any> | Id) {
        if (typeof ClsOrId === 'string') {
            return this.idDefinitionMap.has(ClsOrId);
        } else {
            return this.clsDefinitionMap.has(ClsOrId);
        }
    }

    destructor() {
        this.idDefinitionMap.clear();
        this.clsDefinitionMap.clear();
    }
}

export default IocComponentDefinition;
