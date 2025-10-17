import Target from './target';
import target from '../target';
import Metadata from '../../metadata/create-metadata';
import id from '../id';

/**
 * @public
 */
@id('ConstructorParam')
@target([Target.Type.Class])
class ConstructorParam extends Metadata {
    value: Class<any>[];
}

export default ConstructorParam;
