import Target from './target';
import target from '../target';
import Metadata from '../../metadata/instantiate-one-metadata';
import id from '../id';

/**
 * @public
 */
@id('Configuration')
@target([Target.Type.Class])
class Configuration extends Metadata {}

export default Configuration;
