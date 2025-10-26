/**
 * component
 * 1. 只能用在class或者method上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * view
 * 1. 只能用在class，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * page
 * 1. 只能用在class，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * layout
 * 1. 只能用在class，且只能使用一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * qualifier
 * 1. 只能用在field上，且只能装饰一次
 * 2. 依赖component配合使用
 */
/**
 * autowired
 * 1. 只能用在field上，且只能装饰一次
 * 2. TODO: 只能在view及其复合装饰器组件内部、controller及其复合装饰器组件内部、api装饰器组件内部
 * 3. 自动注入收到分层概念的约束，具体如下：
 *   3.1 view及其复合装饰器内部：controller及其复合装饰器组件, global-data, store, route, router，util及其复合装饰器组件
 *   3.2 controller及其复合装饰器内部：util及其复合装饰器组件
 *   3.3 util及其复合装饰器内部：util以及复合装饰器组件
 */
/**
 * configuration
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * constructor-param
 * 1. 只能用在class上，且只能装饰一次
 */
/**
 * init
 * 1. 只能用在method上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * start
 * 1. 只能用在field上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * target
 * 1. 只能用在field上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * value
 * 1. 只能用在field上，且只能装饰一次
 */
/**
 * reactive
 * 1. 只能用在field上，且只能装饰一次
 */
/**
 * memoized
 * 1. 只能用在method上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * store
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * render
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * route
 * 1. 只能用在class上，且只能装饰一次
 * 2. 在class上使用时，依赖page同时使用
 */
/**
 * router
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * util
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * api
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * bind
 * 1. 只能用在method上，且只能装饰一次
 * 2. 只能在有view装饰器或者view复合装饰器组件上使用
 */
/**
 * effect
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和其他component复合装饰器同时使用
 */
/**
 * global-data
 * 1. 只能用在class上，且只能装饰一次
 * 2. 不能和component复合装饰器同时使用
 */
/**
 * ref
 * 1. 只能用在field上，且只能装饰一次
 * 2. 宿主组件必须是view组件或者是view复合组件
 */
/**
 * refs
 * 1. 只能用在field上，且只能装饰一次
 * 2. 宿主组件必须是view组件或者是view复合组件
 */
/**
 * web-application
 * 1. 只能用在class上，且只能装饰一次
 * 2.
 */

/**
{
  component: {
    view: {
      page: {},
      layout: {},
    },
    effect: {},
    "global-data": {},
    store: {},
    render: {},
    route: {},
    router: {},
    util: {
      document: {},
      api: {},
      localStorage: {},
      sessionStorage: {},
      cookie: {}
    },
    "web-application": {},
    "configuration": {},
  }
}
 */
import Metadata from './instantiate-one-metadata';
import Target from '../decorator/metadata/target';
import { Type } from '../decorator/target';
import Component from '../decorator/metadata/component';
import Configuration from '../decorator/metadata/configuration';
import { createDiagnose, type Diagnose, DiagnoseCode } from 'shared';
import { type MetaMetadata, type BizMetadata } from './index';
import { className2DecoratorName, metadataInstance2DecoratorName } from '../share/util';

type Field = string;

// 元数据的元数据
const metaMetadataMap: Map<Class<Metadata>, { classMetadata: Metadata[] }> = new Map();

// 业务类的元数据
const bizMetadataMap: Map<
    Class<Metadata>,
    {
        classMetadata: Metadata[];
        fieldMetadata: Map<Field, Metadata[]>;
        methodMetadata: Map<Field, Metadata[]>;
    }
> = new Map();

function deleteMetadatas(metadatas: Metadata[], idxs: number[]) {
    idxs.sort((a, b) => b - a);
    idxs.forEach((idx) => metadatas.splice(idx, 1));
}

// 元数据类只能有 KindClass 类型的装饰器
function validateMetaClassOnlyHasKindClassDecorator(
    target: Class<Metadata>,
    { classMetadata, fieldMetadata, methodMetadata }: MetaMetadata
) {
    if (fieldMetadata?.size > 0) {
        const fields = Array.from(fieldMetadata.keys()).join(',');
        fieldMetadata.clear();
        return createDiagnose(DiagnoseCode.CO10022, target.name, fields);
    }
    if (methodMetadata?.size > 0) {
        const methods = Array.from(methodMetadata.keys()).join(',');
        methodMetadata.clear();
        return createDiagnose(DiagnoseCode.CO10023, target.name, methods);
    }
}

function validateHasTargetDecorator(target: Class<Metadata>, metadatas: Metadata[] = []) {
    const idx = metadatas.findIndex((metadata) => metadata instanceof Target);
    if (idx === -1) {
        deleteMetadatas(metadatas, [idx]);
        return createDiagnose(DiagnoseCode.CO10002, target.name);
    } else {
        return undefined;
    }
}

function validateNoNeedTargetDecorator(target: Class<Metadata>, metadatas: Metadata[] = []) {
    const idx = metadatas.findIndex((metadata) => metadata instanceof Target);
    if (idx !== -1) {
        deleteMetadatas(metadatas, [idx]);
        return createDiagnose(DiagnoseCode.CO10007, target.name);
    } else {
        return undefined;
    }
}

function validateDuplicatedDecorator(target: Class<Metadata>, metadatas: Metadata[] = []) {
    const map = new Map<Function, number[]>();
    for (let idx = 0; idx < metadatas.length; idx++) {
        const metadata = metadatas[idx];
        const MetadataClass = metadata.constructor;
        if (map.has(MetadataClass)) {
            map.get(MetadataClass)!.push(idx);
        } else {
            map.set(MetadataClass, [idx]);
        }
    }

    const diagnoseList = [];
    const toDelIdxs = [];
    for (const [MetadataClass, dupIdxs] of map.entries()) {
        if (dupIdxs.length > 1) {
            diagnoseList.push(
                createDiagnose(DiagnoseCode.CO10003, target.name, className2DecoratorName(MetadataClass.name))
            );
            toDelIdxs.push(...dupIdxs);
        }
    }
    if (toDelIdxs.length > 0) {
        deleteMetadatas(metadatas, toDelIdxs);
    }
    return diagnoseList;
}

function hasComponentDecorator(metadatas: Metadata[] = []) {
    return !!metadatas.find((metadata) => metadata instanceof Component);
}

// 是否是Component装饰器或component的一级复合装饰器或component的二级复合装饰器
function isComponentDecorator(
    metadata: Metadata,
    metaMetadataMap: Map<Class<Metadata>, { classMetadata: Metadata[] }>
): boolean {
    // 是否是@component
    if (metadata instanceof Component) {
        return true;
    }
    const MetadataClass = metadata.constructor;
    // 在一级复合中查找
    const classMetadatas = metaMetadataMap.get(MetadataClass as Class<Metadata>)?.classMetadata;
    if (!classMetadatas || classMetadatas.length === 0) {
        return false;
    }
    // 如果当前类的元数据中有Component装饰器，直接返回true
    if (hasComponentDecorator(classMetadatas)) {
        return true;
    }
    // 在二级复合中查找
    for (const classMetadata of classMetadatas) {
        const parentClass = classMetadata.constructor;
        const parentClassMetadatas = metaMetadataMap.get(parentClass as Class<Metadata>)?.classMetadata;
        if (hasComponentDecorator(parentClassMetadatas)) {
            return true;
        }
    }
    return false;
}

function hasConfigurationDecorator(metadatas: Metadata[] = []) {
    return !!metadatas.find((metadata) => metadata instanceof Configuration);
}
// 是否是Configuration装饰器或configuration的一级复合装饰器
function isConfigurationDecorator(
    metadata: Metadata,
    metaMetadataMap: Map<Class<Metadata>, { classMetadata: Metadata[] }>
): boolean {
    // 是否是@configuration
    if (metadata instanceof Configuration) {
        return true;
    }
    const MetadataClass = metadata.constructor;
    // 在一级复合中查找
    const classMetadatas = metaMetadataMap.get(MetadataClass as Class<Metadata>)?.classMetadata;
    if (!classMetadatas || classMetadatas.length === 0) {
        return false;
    }
    // 如果当前类的元数据中有Configuration装饰器，直接返回true
    if (hasConfigurationDecorator(classMetadatas)) {
        return true;
    }
    return false;
}

function validateMoreThenOneComponentDecorator(
    target: Function,
    metadatas: Metadata[],
    metaMetadataMap: Map<Class<Metadata>, { classMetadata: Metadata[] }>
) {
    const componentDecoratorIdxs: number[] = [];

    for (let idx = 0; idx < metadatas.length; idx++) {
        const metadata = metadatas[idx];
        if (isComponentDecorator(metadata, metaMetadataMap)) {
            componentDecoratorIdxs.push(idx);
        }
    }
    if (componentDecoratorIdxs.length > 1) {
        const decoratorNames = componentDecoratorIdxs
            .map((idx) => metadataInstance2DecoratorName(metadatas[idx]))
            .join(', ');
        const diagnose = createDiagnose(DiagnoseCode.CO10001, target.name, decoratorNames);
        deleteMetadatas(metadatas, componentDecoratorIdxs);
        return diagnose;
    }
    return undefined;
}

function validateDecoratorTarget(
    beDecorated: { cls: Class<any>; target: Type; field?: string },
    metadatas: Metadata[],
    metaMetadataMap: Map<Class<Metadata>, { classMetadata: Metadata[] }>
) {
    const diagnoseList: Diagnose[] = [];
    const targetDecoratorIdxs: number[] = [];
    const { cls, target, field } = beDecorated;
    for (let idx = 0; idx < metadatas.length; idx++) {
        const metadata = metadatas[idx];
        const classMetadatas = metaMetadataMap.get(metadata.constructor as Class<Metadata>)?.classMetadata;
        const targetMetadata: Target = classMetadatas?.find((metadata) => metadata instanceof Target) as Target;
        if (targetMetadata && !targetMetadata.value.includes(target)) {
            targetDecoratorIdxs.push(idx);
            switch (target) {
                case Type.Class: {
                    diagnoseList.push(
                        createDiagnose(
                            DiagnoseCode.CO10004,
                            cls.name,
                            metadataInstance2DecoratorName(metadata),
                            targetMetadata.value.join(',')
                        )
                    );
                    break;
                }
                case Type.Field: {
                    diagnoseList.push(
                        createDiagnose(
                            DiagnoseCode.CO10005,
                            cls.name,
                            field,
                            metadataInstance2DecoratorName(metadata),
                            targetMetadata.value.join(',')
                        )
                    );
                    break;
                }
                case Type.Method: {
                    diagnoseList.push(
                        createDiagnose(
                            DiagnoseCode.CO10006,
                            cls.name,
                            field,
                            metadataInstance2DecoratorName(metadata),
                            targetMetadata.value.join(',')
                        )
                    );
                    break;
                }
            }
        }
    }
    if (targetDecoratorIdxs.length > 0) {
        deleteMetadatas(metadatas, targetDecoratorIdxs);
    }
    return diagnoseList;
}

function validateMethodComponentMustInConfiguration(
    beDecorated: {
        cls: Class<Metadata>;
        field: string;
        isConfigClass: boolean;
    },
    metadataList: Metadata[],
    metaMetadataMap: Map<Class<Metadata>, { classMetadata: Metadata[] }>
) {
    const { cls, field, isConfigClass } = beDecorated;
    const toDeleteIdxs: number[] = [];
    const diagnoseList: Diagnose[] = [];
    for (let idx = 0; idx < metadataList.length; idx++) {
        const metadata = metadataList[idx];
        // 如果有component装饰器，且不是配置类，则报错
        if (metadata instanceof Component && !isConfigClass) {
            diagnoseList.push(createDiagnose(DiagnoseCode.CO10008, cls.name, field, cls.name));
            toDeleteIdxs.push(idx);
        }
    }
    if (toDeleteIdxs.length > 0) {
        deleteMetadatas(metadataList, toDeleteIdxs);
    }
    return diagnoseList;
}

function validate(metadataList: [Map<Class<Metadata>, MetaMetadata>, Map<Class<Metadata>, BizMetadata>]) {
    // 诊断信息
    const diagnoseList: Diagnose[] = [];
    const [metaMetadataMap, bizMetadataMap] = metadataList;
    // 先校验元数据类

    // 元数据类必须添加target装饰器
    const keys = metaMetadataMap.keys();
    for (const metadataClass of keys) {
        const value = metaMetadataMap.get(metadataClass);
        const diagnose = validateHasTargetDecorator(metadataClass, value!.classMetadata);
        if (diagnose) {
            diagnoseList.push(diagnose);
            metaMetadataMap.delete(metadataClass);
        }
    }

    // 元数据类只有 KindClass 类型的装饰器
    for (const [metadataClass, value] of metaMetadataMap.entries()) {
        const diagnose = validateMetaClassOnlyHasKindClassDecorator(metadataClass, value);
        if (diagnose) {
            diagnoseList.push(diagnose);
        }
    }

    // 元数据类校验是否包含重复装饰器
    for (const [metadataClass, metadataList] of metaMetadataMap.entries()) {
        const diagnose = validateDuplicatedDecorator(metadataClass, metadataList.classMetadata);
        if (diagnose.length) {
            diagnoseList.push(...diagnose);
        }
    }

    // 元数据类校验不能包含大于1个component装饰器
    for (const [metadataClass, metadataList] of metaMetadataMap.entries()) {
        const diagnose = validateMoreThenOneComponentDecorator(
            metadataClass,
            metadataList.classMetadata,
            metaMetadataMap
        );
        if (diagnose) {
            diagnoseList.push(diagnose);
        }
    }

    // 元数据类的清理，如果这时候classMetadata长度为0了，那么从map中删除
    for (const [metadataClass, { classMetadata }] of metaMetadataMap.entries()) {
        if (classMetadata.length === 0) {
            metaMetadataMap.delete(metadataClass);
        }
    }

    // 业务类校验是否包含重复装饰器
    // for (const [metadataClass, metadataList] of bizMetadataMap.entries()) {
    //     const diagnose = validateDuplicatedDecorator(metadataClass, metadataList.classMetadata);
    //     if (diagnose.length) {
    //         let invalidMetadata: Diagnose[]
    //         if (diagnoseMap.has(metadataClass)) {
    //             invalidMetadata = diagnoseMap.get(metadataClass)!;
    //         } else {
    //             invalidMetadata = []
    //             diagnoseMap.set(metadataClass, invalidMetadata);
    //         }
    //         invalidMetadata.push(...diagnose);
    //     }
    // }

    // 业务类不需要添加@target装饰器
    for (const [metadataClass, metadataList] of bizMetadataMap.entries()) {
        const diagnose = validateNoNeedTargetDecorator(metadataClass, metadataList.classMetadata);
        if (diagnose) {
            diagnoseList.push(diagnose);
        }
    }

    // 校验业务类不能包含大于1个component装饰器
    for (const [metadataClass, metadataList] of bizMetadataMap.entries()) {
        const diagnose = validateMoreThenOneComponentDecorator(
            metadataClass,
            metadataList.classMetadata,
            metaMetadataMap
        );
        if (diagnose) {
            diagnoseList.push(diagnose);
        }
    }

    // 校验业务类的装饰器的目标是否符合装饰器的target值
    for (const [metadataClass, metadataList] of bizMetadataMap.entries()) {
        const diagnoses = validateDecoratorTarget(
            { cls: metadataClass, target: Type.Class },
            metadataList.classMetadata,
            metaMetadataMap
        );
        if (diagnoses.length) {
            diagnoseList.push(...diagnoses);
        }
        for (const [field, fieldMetadata] of metadataList.fieldMetadata.entries()) {
            const diagnoses = validateDecoratorTarget(
                { cls: metadataClass, target: Type.Field, field },
                fieldMetadata,
                metaMetadataMap
            );
            if (diagnoses.length) {
                diagnoseList.push(...diagnoses);
            }
        }
        for (const [field, methodMetadata] of metadataList.methodMetadata.entries()) {
            const diagnoses = validateDecoratorTarget(
                { cls: metadataClass, target: Type.Method, field },
                methodMetadata,
                metaMetadataMap
            );
            if (diagnoses.length) {
                diagnoseList.push(...diagnoses);
            }
        }
    }

    // 校验如果使用component注入第三方组件，则必须在配置类内部。
    for (const [metadataClass, metadataList] of bizMetadataMap.entries()) {
        const isConfigClass = !!metadataList.classMetadata.find((metadata) =>
            isConfigurationDecorator(metadata, metaMetadataMap)
        );
        for (const [field, methodMetadata] of metadataList.methodMetadata.entries()) {
            const diagnoses = validateMethodComponentMustInConfiguration(
                { cls: metadataClass, field, isConfigClass },
                methodMetadata,
                metaMetadataMap
            );
            if (diagnoses.length) {
                diagnoseList.push(...diagnoses);
            }
        }
    }

    return diagnoseList;
}

export default validate;
