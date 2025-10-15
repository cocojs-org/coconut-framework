import { Metadata, component, SCOPE, scope, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
@scope(SCOPE.Prototype)
class Effect extends Metadata {}

defineMetadataId(Effect);
export default Effect;
