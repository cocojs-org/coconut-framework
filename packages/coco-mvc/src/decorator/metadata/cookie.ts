import { Metadata, target, Target, id } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@id('Cookie')
@target([Target.Type.Class])
@util()
class Cookie extends Metadata {}

export default Cookie;
