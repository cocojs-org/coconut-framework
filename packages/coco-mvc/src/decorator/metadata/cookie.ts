import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class Cookie extends Metadata {}

defineMetadataId(Cookie);
export default Cookie;
