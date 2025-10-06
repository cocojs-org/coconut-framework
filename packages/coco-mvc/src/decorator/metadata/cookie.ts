import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class Cookie extends Metadata {}

assignMetadataId(Cookie);
export default Cookie;
