import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';
import view from '../view';

/**
 * @public
 */
@target([Target.Type.Class])
@view()
class Layout extends Metadata {}

assignMetadataId(Layout);
export default Layout;
