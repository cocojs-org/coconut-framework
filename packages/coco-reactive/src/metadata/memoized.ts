import {
  type ApplicationContext,
  Metadata,
  target,
  Target,
} from 'coco-ioc-container';
import Subscriber from '../memoized/subscriber.ts';

/**
 * @public
 */
@target([Target.Type.Method])
class Memoized extends Metadata {
  static postConstruct(
    metadata: Memoized,
    appCtx: ApplicationContext,
    name: string
  ) {
    const fn = this[name];
    const subscriber = new Subscriber(fn.bind(this));
    this[name] = subscriber.memoizedFn;
  }
}

export default Memoized;
