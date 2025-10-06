import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';
import view from '../view';

/**
 * @public
 */
@target([Target.Type.Class])
@view()
class Page extends Metadata {}

defineMetadataId(Page);
export default Page;
