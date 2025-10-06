import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class SessionStorage extends Metadata {}

assignMetadataId(SessionStorage);
export default SessionStorage;
