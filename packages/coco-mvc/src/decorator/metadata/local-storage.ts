import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class LocalStorage extends Metadata {}

defineMetadataId(LocalStorage);
export default LocalStorage;
