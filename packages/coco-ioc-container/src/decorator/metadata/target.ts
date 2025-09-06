import Metadata from '../../metadata/metadata';
import target, { Type } from '../target';

/**
 * @public
 */
@target([Type.Class], true)
class Target extends Metadata {
  static Type = Type;

  value: Type[];
}

export default Target;
