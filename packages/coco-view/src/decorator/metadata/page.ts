import { Metadata, target, Target, id } from 'coco-ioc-container';
import view from '../view';

/**
 * @public
 */
@id('Page')
@target([Target.Type.Class])
@view()
class Page extends Metadata {}

export default Page;
