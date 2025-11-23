import Metadata from '../../metadata/instantiate-one-metadata';
import id from '../id';
import target from '../target';
import Target from './target';

/**
 * @public
 */
@id.decorateSelf('Id')
@target([Target.Type.Class])
class Id extends Metadata {
    value: string;
}

export default Id;
