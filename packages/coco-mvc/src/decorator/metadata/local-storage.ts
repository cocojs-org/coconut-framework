import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class LocalStorage extends Metadata {}

assignMetadataId(LocalStorage);
export default LocalStorage;
