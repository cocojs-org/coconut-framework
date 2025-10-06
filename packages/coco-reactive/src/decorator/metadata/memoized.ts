import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method])
class Memoized extends Metadata {}

defineMetadataId(Memoized);
export default Memoized;
