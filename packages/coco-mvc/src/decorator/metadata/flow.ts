import { Metadata, component, SCOPE, scope, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Flow')
@target([Target.Type.Class])
@component()
@scope(SCOPE.Prototype)
class Flow extends Metadata {}

export default Flow;
