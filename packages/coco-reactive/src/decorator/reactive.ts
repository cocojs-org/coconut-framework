import {
  createDecoratorExp,
  type Application,
  type Decorator,
} from 'coco-ioc-container';
import Reactive from './metadata/reactive';
import Publisher from '../memoized/publisher';
import Subscriber from '../memoized/subscriber';
import { reactiveSetterField } from 'shared';

let didWarnedReadValueFromUnderscoreName = false;

export default createDecoratorExp(Reactive, {
  componentPostConstruct(
    metadata: Reactive,
    application: Application,
    name: string
  ) {
    let _value: any = this[name];
    const publisher = new Publisher(name);
    Object.defineProperty(this, name, {
      configurable: false,
      enumerable: true,
      get: function () {
        if (Subscriber.Executing) {
          Subscriber.Executing.subscribe(publisher);
        }
        return _value;
      },
      set(v: any): boolean {
        if (_value === v || (v !== v && _value !== _value)) {
          return true;
        }
        publisher.notify();
        this.updater.enqueueSetState(this, name, v);
        return true;
      },
    });

    // 使用单独的field名称来更新this.name
    Object.defineProperty(this, reactiveSetterField(name), {
      configurable: false,
      enumerable: false,
      get: function () {
        if (__DEV__) {
          if (!didWarnedReadValueFromUnderscoreName) {
            didWarnedReadValueFromUnderscoreName = true;
            console.error(
              `${reactiveSetterField(name)}仅仅用于更新${name}，想要取值直接使用this.${name}即可`
            );
          }
        }
        return _value;
      },
      set(v: any): boolean {
        _value = v;
        return true;
      },
    });
  },
}) as () => Decorator<ClassFieldDecoratorContext | ClassDecoratorContext>;
