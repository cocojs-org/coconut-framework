import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Ref extends Metadata {}

defineMetadataId(Ref);
export default Ref;
