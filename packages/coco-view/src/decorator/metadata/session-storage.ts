import { Metadata, target, Target, id, component } from 'coco-ioc-container';

/**
 * @public
 */
@id('SessionStorage')
@target([Target.Type.Class])
@component()
class SessionStorage extends Metadata {}

export default SessionStorage;
