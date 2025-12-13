import Metadata from '../../metadata/instantiate-one-metadata';
import Target from './target';
import target from '../target';

/**
 * @public
 */
@target([Target.Type.Method])
class Cocoid extends Metadata {
    value: string;
}

export default Cocoid;
