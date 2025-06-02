import {
  Metadata,
  component,
  Component,
  target,
  Target,
  type ApplicationContext,
} from 'coco-ioc-container';
import Remote from '../reactive-autowired/remote.ts';

export const sym_remote = Symbol.for('remote');
/**
 * @public
 */
@target([Target.Type.Class])
@component(Component.Scope.Singleton)
class Store extends Metadata {
  static postConstruct(metadata: Store, appCtx: ApplicationContext) {
    // todo 放在ioc容器里面吧，没必要放在this上
    this[sym_remote] = new Remote(this.constructor);
  }
}

export default Store;
