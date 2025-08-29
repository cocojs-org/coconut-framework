import Target from './target';
import target from '../target';
import Metadata from './abstract/metadata';

/**
 * @public
 */
@target([Target.Type.Class])
class ConstructorParam extends Metadata {
  value: Class<any>[];
}

export default ConstructorParam;
