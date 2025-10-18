import Target from './target';
import target from '../target';
import Metadata from '../../metadata/instantiate-one-metadata';
import id from '../id';

/**
 * @public
 */
@id('Autowired')
@target([Target.Type.Field])
class Autowired extends Metadata {
    value: Class<any>;
}

export default Autowired;
