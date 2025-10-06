import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class Api extends Metadata {}

assignMetadataId(Api);
export default Api;
