import { Metadata, target, Target, component } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class LocalStorage extends Metadata {}

export default LocalStorage;
