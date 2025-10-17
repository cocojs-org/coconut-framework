import { Metadata, target, Target, id } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@id('SessionStorage')
@target([Target.Type.Class])
@util()
class SessionStorage extends Metadata {}

export default SessionStorage;
