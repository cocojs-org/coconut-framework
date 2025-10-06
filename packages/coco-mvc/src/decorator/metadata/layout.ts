import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';
import view from '../view';

/**
 * @public
 */
@target([Target.Type.Class])
@view()
class Layout extends Metadata {}

defineMetadataId(Layout);
export default Layout;
