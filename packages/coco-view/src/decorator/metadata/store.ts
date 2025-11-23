import { Metadata, component, target, Target, type Application, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Store')
@target([Target.Type.Class])
@component()
class Store extends Metadata {}

export default Store;
