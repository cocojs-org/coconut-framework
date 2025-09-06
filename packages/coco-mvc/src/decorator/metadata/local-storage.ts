import { Metadata, target, Target } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class LocalStorage extends Metadata {}

export default LocalStorage;
