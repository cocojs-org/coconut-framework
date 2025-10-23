import { isDescendantOf, uppercaseFirstLetter } from '../share/util';
import { createDiagnose, DiagnoseCode, stringifyDiagnose } from 'shared';

/**
 * 所有被扫描的规范的组件
 * 包括：
 * 1. 项目中添加@component类装饰的组件
 * 2. 第三方添加@component类装饰的组件
 * 3. 项目中通过@component方法装饰注册的组件
 */
export interface IocComponentDefinition<T> {
    // 组件id，每个组件的id是唯一的
    id: string;

    cls: Class<T>;

    // 是否是单例模式，否则每次实例化都会创建一个新的实例
    isSingleton: boolean;

    // 实例化方式
    instantiateType: 'new' | 'method';
    // 当实例化方式为method时对应的选项
    methodInstantiateOpts?: {
        configurationCls: Class<any>; // 配置类
        method: string; // 方法名
    };
}

function newIocComponentDefinition<T>(
    id: string,
    cls: Class<T>,
    isSingleton: boolean,
    instantiateType: 'new' | 'method'
): IocComponentDefinition<T> {
    return { id, cls, isSingleton, instantiateType };
}

type Id = string;
const idDefinitionMap: Map<Id, IocComponentDefinition<any>> = new Map();
const clsDefinitionMap: Map<Class<any>, IocComponentDefinition<any>> = new Map();

function addDefinition(
    cls: Class<any>,
    isSingleton: boolean,
    methodInstantiateOpts?: { configurationCls: Class<any>; method: string }
) {
    const existClsDef = clsDefinitionMap.get(cls);
    if (existClsDef) {
        throw new Error(`存在同名的组件: [${existClsDef.cls.name}] - [${cls.name}]`);
    }
    const id = uppercaseFirstLetter(cls.name);
    if (typeof id !== 'string' || !id.trim()) {
        throw new Error(`生成组件id失败: [${cls.name}]`);
    }
    const existIdDef = idDefinitionMap.get(id);
    if (existIdDef) {
        throw new Error(`存在id的组件: [${existIdDef.cls.name}] - [${cls.name}]`);
    }
    const componentDefinition = newIocComponentDefinition(
        id,
        cls,
        isSingleton,
        methodInstantiateOpts ? 'method' : 'new'
    );
    if (methodInstantiateOpts) {
        componentDefinition.methodInstantiateOpts = methodInstantiateOpts;
    }
    idDefinitionMap.set(id, componentDefinition);
    clsDefinitionMap.set(cls, componentDefinition);
}

/**
 * 获取真正会实例化的类定义
 * @param ClsOrId 想要实例化的类或类id
 * @param qualifier 如果存在多个后端类，需要通过qualifier指定具体的类id
 * @returns 真正会实例化的类定义
 */
function getInstantiateDefinition(ClsOrId: Class<any> | Id, qualifier?: string) {
    const definition = getDefinition(ClsOrId);
    if (!definition) {
        const diagnose = createDiagnose(DiagnoseCode.CO10011, typeof ClsOrId === 'string' ? ClsOrId : ClsOrId.name);
        throw new Error(stringifyDiagnose(diagnose));
    }
    const descendantList: Class<any>[] = Array.from(clsDefinitionMap.keys()).filter((i) =>
        isDescendantOf(i, definition.cls)
    );
    if (descendantList.length === 0) {
        // 没有子组件直接返回本身
        return definition;
    } else if (descendantList.length === 1) {
        // 有一个子组件
        return clsDefinitionMap.get(descendantList[0]);
    } else {
        // 多个子组件
        if (qualifier) {
            for (const child of descendantList) {
                const def = clsDefinitionMap.get(child);
                if (def.id === qualifier) {
                    return def;
                }
            }
        }
        if (qualifier) {
            const diagnose = createDiagnose(
                DiagnoseCode.CO10010,
                definition.id,
                descendantList.map((i) => i.name),
                qualifier
            );
            throw new Error(stringifyDiagnose(diagnose));
        } else {
            const diagnose = createDiagnose(
                DiagnoseCode.CO10009,
                definition.id,
                descendantList.map((i) => i.name)
            );
            throw new Error(stringifyDiagnose(diagnose));
        }
    }
}

function getDefinition(ClsOrId: Class<any> | Id) {
    if (typeof ClsOrId === 'string') {
        return idDefinitionMap.get(ClsOrId);
    } else {
        return clsDefinitionMap.get(ClsOrId);
    }
}

function existDefinition(ClsOrId: Class<any> | Id) {
    if (typeof ClsOrId === 'string') {
        return idDefinitionMap.has(ClsOrId);
    } else {
        return clsDefinitionMap.has(ClsOrId);
    }
}

function clear() {
    idDefinitionMap.clear();
    clsDefinitionMap.clear();
}

export { type Id, clear, existDefinition, getInstantiateDefinition, getDefinition, addDefinition };
