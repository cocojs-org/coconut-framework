import Target from './target';
import target from '../target';
import Metadata from './abstract/metadata';

/**
 * @public
 */
@target([Target.Type.Field])
class Value extends Metadata {
  value: string;
}

export default Value;
