import {
  Metadata,
  component,
  Component,
  target,
  Target,
  type Application,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component(Component.Scope.Singleton)
class Store extends Metadata {}

export default Store;
