import { Metadata, target, Target } from 'coco-ioc-container';
import view from '../view';

/**
 * @public
 */
@target([Target.Type.Class])
@view()
class Layout extends Metadata {}

export default Layout;
