import { Metadata, component, SCOPE, scope, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Effect')
@target([Target.Type.Class])
@component()
@scope(SCOPE.Prototype)
class Effect extends Metadata {}

export default Effect;
