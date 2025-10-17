import Target from './target';
import target from '../target';
import Metadata from '../../metadata/create-metadata';
import id from '../id';

/**
 * @public
 */
@id('Qualifier')
@target([Target.Type.Field])
class Qualifier extends Metadata {
    value: string;
}

export default Qualifier;
