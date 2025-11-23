import { Metadata, target, Target, id, component } from 'coco-ioc-container';

/**
 * @public
 */
@id('LocalStorage')
@target([Target.Type.Class])
@component()
class LocalStorage extends Metadata {}

export default LocalStorage;
