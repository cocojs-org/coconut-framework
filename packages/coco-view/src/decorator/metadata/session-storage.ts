import { Metadata, target, Target, component } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class SessionStorage extends Metadata {}

export default SessionStorage;
