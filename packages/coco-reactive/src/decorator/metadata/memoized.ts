import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method])
class Memoized extends Metadata {}

assignMetadataId(Memoized);
export default Memoized;
