import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Ref extends Metadata {}

assignMetadataId(Ref);
export default Ref;
