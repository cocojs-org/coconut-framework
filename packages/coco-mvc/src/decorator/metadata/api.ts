import { Metadata, target, Target, id } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@id('Api')
@target([Target.Type.Class])
@util()
class Api extends Metadata {}

export default Api;
