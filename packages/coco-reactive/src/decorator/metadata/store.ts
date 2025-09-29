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
@component()
class Store extends Metadata {}

export default Store;
