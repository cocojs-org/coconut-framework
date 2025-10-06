import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method])
class Bind extends Metadata {}

assignMetadataId(Bind);
export default Bind;
