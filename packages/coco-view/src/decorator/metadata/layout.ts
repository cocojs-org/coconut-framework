import { Metadata, target, Target, id } from 'coco-ioc-container';
import view from '../view';

/**
 * @public
 */
@id('Layout')
@target([Target.Type.Class])
@view()
class Layout extends Metadata {}

export default Layout;
