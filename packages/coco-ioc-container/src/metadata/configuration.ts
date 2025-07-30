import Target from './target';
import target from '../decorator/target';
import Metadata from './abstract/metadata';

/**
 * @public
 */
@target([Target.Type.Class])
class Configuration extends Metadata {}

export default Configuration;
