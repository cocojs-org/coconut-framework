import Target from './target';
import target from '../target';
import Metadata from '../../metadata/instantiate-one-metadata';

/**
 * @public
 */
@target([Target.Type.Class])
class Configuration extends Metadata {}

export default Configuration;
