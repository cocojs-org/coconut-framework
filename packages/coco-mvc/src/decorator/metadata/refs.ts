import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Refs extends Metadata {}

assignMetadataId(Refs);
export default Refs;
