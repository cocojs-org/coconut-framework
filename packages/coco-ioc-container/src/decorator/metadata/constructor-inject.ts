import Target from './target';
import target from '../target';
import Metadata from '../../metadata/instantiate-one-metadata';

/**
 * @public
 */
@target([Target.Type.Class])
class ConstructorInject extends Metadata {
    value: Class<any>[];
}

export default ConstructorInject;
