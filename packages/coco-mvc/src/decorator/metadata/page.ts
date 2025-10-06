import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';
import view from '../view';

/**
 * @public
 */
@target([Target.Type.Class])
@view()
class Page extends Metadata {}

assignMetadataId(Page);
export default Page;
