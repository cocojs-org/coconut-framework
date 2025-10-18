import Target from './target';
import target from '../target';
import Metadata from '../../metadata/instantiate-one-metadata';
import id from '../id';

/**
 * @public
 */
@id('Value')
@target([Target.Type.Field])
class Value extends Metadata {
    value: string;
}

export default Value;
