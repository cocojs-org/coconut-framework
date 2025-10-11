/**
 * 关于autowired装饰器相关逻辑
 */
import { getMvcApi } from './common-api';
import { StoreSubscriber } from 'coco-view';

// 在一个组件中多次注入同一个store
let warnedAutowiredSameStoreInOneComponentMultipleTimes;

/**
 * 视图组件实例，如果其类自动注入了store，那么关联*视图组件实例*和*store实例*
 */
function connectStore(ctor, instance) {
  const { application, getMetaClassById } = getMvcApi();
  // 找到所有的注入
  const Autowired = getMetaClassById('Autowired');
  const autowiredFields = application.listFieldByMetadataCls(ctor, Autowired, true);
  const autowiredComponents = autowiredFields.map(field => instance[field]);
  const Store = getMetaClassById('Store');
  // 过滤出所有注入的store
  // TODO: autowiredComponents有可能是undefined，需要处理
  const stores = autowiredComponents.filter(comp => application.findClassMetadata(comp.constructor, Store));
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
  if (uniqueStores.length > 0) {
    const runner = {
        exec: () => {
          instance.updater.enqueueForceUpdate(instance, null, 'forceUpdate');
        }
    }
    const storeSubscriber = new StoreSubscriber(runner);
    Object.defineProperty(instance, 'storeSubscriber', {
      value: storeSubscriber,
      writable: false,
      enumerable: false,
      configurable: true
    })
    uniqueStores.forEach(store => {
      storeSubscriber.connect(store.storePublisher);
    });
  }

}

function disconnectStore(instance) {
  const storeSubscriber = instance.storeSubscriber;
  if (storeSubscriber) { 
    delete instance.storeSubscriber;
    storeSubscriber.disconnectAll();
  }
}

export {
  connectStore,
  disconnectStore
}