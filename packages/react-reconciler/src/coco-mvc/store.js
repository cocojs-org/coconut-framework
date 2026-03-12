/**
 * store组件
 * 为了在store实例上进行状态更新，且使用fiber的reconciler机制，所以我们为每个store实例都创建一个fiber
 * 属性名尽量与真正的fiber对象保持一致，这样就可以尽量复用fiber的更新函数
 * 但注意store组件对应的fiber对象不会添加到fiber树中，即不会影响fiber树的形状和节点链接关系。
 */
import { getMvcApi } from './common-api';
import { enqueueConcurrentClassUpdate } from "../ReactFiberConcurrentUpdate";
import { processUpdateQueue } from '../ReactFiberClassUpdateQueue';
import { initializeUpdateQueue, createUpdate } from '../ReactFiberClassUpdateQueue';
import { get, NAME, reactiveAssignField } from 'shared';


const fiberField = '_fiber';
const updaterField = 'updater'; // 类比react组件的updater
const bindViewInst = '_viewInst'; // 当更新store的属性时，需要知道是哪个视图组件触发的，才能找到对象的fiber对象，然后触发重新渲染。
const innerStoreInst = '_storeInst'; // 指向store实例

// 在一个组件中多次注入同一个store
let warnedAutowiredSameStoreInOneComponentMultipleTimes;

/**
 * 适用store组件的enqueueUpdate
 * 让update进入store的fiber的更新队列中，同时让对应的视图组件的fiber对象找到fiber树根节点。
 */
function enqueueUpdate(fiber, update, viewComponentFiber) {
    const updateQueue = fiber.updateQueue;
    if (updateQueue === null) {
        return null;
    }

    const sharedQueue = updateQueue.shared;
    return enqueueConcurrentClassUpdate(viewComponentFiber, sharedQueue, update);
}

const storeComponentUpdater = {
    enqueueSetState(inst, field, payload) {
        const fiber = inst[fiberField];
        const viewInstance = inst[bindViewInst];
        if (viewInstance === null || viewInstance === undefined) {
            console.error("单独对store属性赋值并不能触发页面渲染，需要在视图组件中赋值。")
            return;
        }
        const update = createUpdate(field);
        update.payload = payload;
        const viewComponentFiber = viewInstance._reactInternals;
        const root = enqueueUpdate(fiber, update, viewComponentFiber);
        if (root !== null) {
            const scheduleUpdateOnFiber = get(NAME.scheduleUpdateOnFiber);
            if (scheduleUpdateOnFiber) {
                scheduleUpdateOnFiber(root, viewComponentFiber, viewInstance);
            }
        }
    }
}

/**
 * 返回store的一个代理对象，主要目的赋值的时候知道对应的视图组件
 */
function proxy(store, storeCtor, viewComponent) {
    const { application } = getMvcApi();
    const proxied = { [innerStoreInst]: store };
    const Reactive = application.getMetaClassById('Reactive');
    const fields = application.listFieldByMetadataCls(storeCtor, Reactive);
    for (const field of fields) {
        Object.defineProperty(proxied, field, {
            enumerable: true,
            get() {
                return store[field];
            },
            set(val) {
                store[bindViewInst] = viewComponent;
                store[field] = val;
                store[bindViewInst] = null;
            }
        })
    }
    return proxied;
}

function proxyStoreComponent(ctor, viewComponent) {
    const { application } = getMvcApi();
    // 找到所有的注入
    const Autowired = application.getMetaClassById('Autowired');
    const Store = application.getMetaClassById('Store');
    const autowiredFields = application.listFieldByMetadataCls(ctor, Autowired);
    // 过滤出所有注入的store
    for (const field of autowiredFields) {
        const component = viewComponent[field];
        if (component && application.findClassKindMetadataRecursively(component.constructor, Store, 0)) {
            // store组件访问的是代理对象，非原始组件
            viewComponent[field] = proxy(component, component.constructor, viewComponent);
        }
    }
}

/**
 * 返回视图组件所有自动注入的store实例
 */
function getAutowiredStores(ctor, instance) {
    const { application } = getMvcApi();
    // 找到所有的注入
    const Autowired = application.getMetaClassById('Autowired');
    const autowiredFields = application.listFieldByMetadataCls(ctor, Autowired);
    const autowiredComponents = autowiredFields.map((field) => instance[field]);
    // 找到所有的storeProxy
    const stores = autowiredComponents
        .filter(Boolean)
        .map((proxy) => proxy[innerStoreInst])
        .filter(Boolean);
    // store去重
    const uniqueStores = stores.filter((s, idx) => {
        const index = stores.indexOf(s);
        if (__DEV__) {
            if (!warnedAutowiredSameStoreInOneComponentMultipleTimes && index !== idx) {
                warnedAutowiredSameStoreInOneComponentMultipleTimes = true;
                console.warn('%s组件中多次注入%s，只需要注入一次就够了。', ctor.name, s.constructor?.name);
            }
        }
        return index === idx;
    });

    return uniqueStores;
}

function createFiber(storeInstance) {
    const ctor = storeInstance.constructor;
    const { application } = getMvcApi();
    const Autowired = application.getMetaClassById('Autowired');
    const autowiredFields = application.listFieldByMetadataCls(ctor, Autowired);
    return {
        alternate: null,
        stateNode: null,
        updateQueue: null,
        memoizedState: autowiredFields.reduce((prev, field) => {
            prev[field] = storeInstance[field];
            return prev;
        }, {}),
    }
}

/**
 * 处理掉所有的update对象，更新store值
 */
function processUpdateQueueForStore(ctor, instance) {
    const { application } = getMvcApi();
    const stores = getAutowiredStores(ctor, instance);
    if (stores.length > 0) {
        stores.forEach(function(store) {
            processUpdateQueue(store[fiberField], {}, store);
            // assign new value
            const newState = store[fiberField].memoizedState;
            const storeCtor = store.constructor;
            const Reactive = application.getMetaClassById('Reactive');
            const fields = application.listFieldByMetadataCls(storeCtor, Reactive);
            for (const field of fields) {
                store[reactiveAssignField(field)] = newState[field];
            }
        })
    }
}

// TODO 放在store组件实例化的地方
function initFiber(storeInstance) {
    if (storeInstance[fiberField]) {
        return;
    }
    storeInstance[fiberField] = createFiber(storeInstance);
    storeInstance[updaterField] = storeComponentUpdater;
    initializeUpdateQueue(storeInstance[fiberField]);
}

/**
 * 视图组件实例，如果其类自动注入了store，那么关联*视图组件实例*和*store实例*
 */
function connectStore(ctor, instance) {
    proxyStoreComponent(ctor, instance);
    const stores = getAutowiredStores(ctor, instance);
    if (stores.length > 0) {
        stores.forEach((store) => initFiber(store));
    }
}

export { processUpdateQueueForStore, connectStore };
