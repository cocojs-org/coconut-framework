import {
  createDecoratorExp,
  type Decorator,
  type Application,
} from 'coco-ioc-container';
import Memoized from './metadata/memoized';
import Subscriber from '../memoized/subscriber';

export default createDecoratorExp(Memoized, {
  componentPostConstruct: function (
    metadata: Memoized,
    application: Application,
    field?: string
  ) {
    const fn = this[field];
    const subscriber = new Subscriber(fn.bind(this));
    this[field] = subscriber.memoizedFn;
  },
}) as () => Decorator<ClassMethodDecoratorContext>;
