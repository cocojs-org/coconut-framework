import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Refs extends Metadata {}

defineMetadataId(Refs);
export default Refs;
