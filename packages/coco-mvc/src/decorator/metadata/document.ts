import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class Document extends Metadata {}

assignMetadataId(Document);
export default Document;
