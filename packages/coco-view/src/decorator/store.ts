import { createDecoratorExp, type Decorator, type Application } from 'coco-ioc-container';
import Store from './metadata/store';
import StorePublisher from '../reactive/store-publisher';
import Publisher from '../reactive/publisher';
import Subscriber from '../reactive/subscriber';

export default createDecoratorExp(Store, {
    componentPostConstruct: function (metadata: Store, application: Application) {
        // 和使用store的组件保持订阅关系
        const storePublisher = new StorePublisher();
        Object.defineProperty(this, 'storePublisher', {
            value: storePublisher,
            writable: false,
            enumerable: false,
            configurable: true,
        });

        const _values: Record<any, any> = {};
        for (const field of Object.keys(this)) {
            // 和@memoized保持订阅关系
            const publisher = new Publisher();
            _values[field] = this[field];
            // TODO: 目前有store props reactive 基本上都使用了类似的逻辑处理响应式，能不能抽象出一个函数
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
                    if (_values[field] === v || (v !== v && _values[field] !== _values[field])) {
                        return true;
                    }
                    _values[field] = v;
                    publisher.notify();
                    storePublisher.broadcast();
                    return true;
                },
            });
        }
    },
}) as () => Decorator<ClassDecoratorContext>;
