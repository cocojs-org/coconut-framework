import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class Api extends Metadata {}

defineMetadataId(Api);
export default Api;
