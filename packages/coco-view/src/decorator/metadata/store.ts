import { Metadata, component, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class Store extends Metadata {}

export default Store;
