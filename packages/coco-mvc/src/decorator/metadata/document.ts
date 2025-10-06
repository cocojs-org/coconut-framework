import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class Document extends Metadata {}

defineMetadataId(Document);
export default Document;
