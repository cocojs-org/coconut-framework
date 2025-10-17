import { Metadata, target, Target, id } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@id('LocalStorage')
@target([Target.Type.Class])
@util()
class LocalStorage extends Metadata {}

export default LocalStorage;
