import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class SessionStorage extends Metadata {}

defineMetadataId(SessionStorage);
export default SessionStorage;
