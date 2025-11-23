import { createDecoratorExp, type Decorator, type Application } from 'coco-ioc-container';
import Store from './metadata/store';
import StorePublisher from '../reactive/store-publisher';

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
    },
}) as () => Decorator<ClassDecoratorContext>;
