import {
  Metadata,
  component,
  Component,
  target,
  Target,
  type Application,
} from 'coco-ioc-container';
import StorePublisher from '../reactive-autowired/store-publisher.ts';
import Publisher from '../memoized/publisher.ts';
import Subscriber from '../memoized/subscriber.ts';

/**
 * @public
 */
@target([Target.Type.Class])
@component(Component.Scope.Singleton)
class Store extends Metadata {
  static postConstruct(metadata: Store, application: Application) {
    const storePublisher = new StorePublisher();
    Object.defineProperty(this, 'storePublisher', {
      value: storePublisher,
      writable: false,
      enumerable: false,
      configurable: true,
    });

    // 用于和@memoized保持订阅关系
    const publisher = new Publisher();
    const _values: Record<any, any> = {};
    for (const field of Object.keys(this)) {
      _values[field] = this[field];
      // TODO: 和@memoized保持订阅关系，那么应该和@reactive采用一样的实现逻辑
      Object.defineProperty(this, field, {
        configurable: false,
        enumerable: true,
        get: function () {
          if (Subscriber.Executing) {
            Subscriber.Executing.subscribe(publisher);
          }
          return _values[field];
        },
        set(v: any): boolean {
          _values[field] = v;
          publisher.notify();
          storePublisher.broadcast();
          return true;
        },
      });
    }
  }
}

export default Store;
