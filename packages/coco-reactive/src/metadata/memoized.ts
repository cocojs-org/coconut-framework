import { type Application, Metadata, target, Target } from 'coco-ioc-container';
import Subscriber from '../memoized/subscriber';

/**
 * @public
 */
@target([Target.Type.Method])
class Memoized extends Metadata {
  static postConstruct(
    metadata: Memoized,
    application: Application,
    name: string
  ) {
    const fn = this[name];
    const subscriber = new Subscriber(fn.bind(this));
    this[name] = subscriber.memoizedFn;
  }
}

export default Memoized;
