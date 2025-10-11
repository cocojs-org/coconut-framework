import {
  createDecoratorExp,
  type Application,
  type Decorator,
} from 'coco-ioc-container';
import Reactive from './metadata/reactive';
import Publisher from '../memoized/publisher';
import Subscriber from '../memoized/subscriber';
import { reactiveAssignField } from 'shared';

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

    Object.defineProperty(this, reactiveAssignField(name), {
      configurable: false,
      enumerable: false,
      set(v: any): boolean {
        _value = v;
        return true;
      },
    });
  },
}) as () => Decorator<ClassFieldDecoratorContext | ClassDecoratorContext>;
