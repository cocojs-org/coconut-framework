import Metadata from './abstract/metadata';
import target, { Type } from '../decorator/target';

/**
 * @public
 */
@target([Type.Class], true)
class Target extends Metadata {
  static Type = Type;

  value: Type[];
}

export default Target;
