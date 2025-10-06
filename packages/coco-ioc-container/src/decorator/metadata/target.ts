import Metadata from '../../metadata/create-metadata';
import target, { Type } from '../target';
import { defineMetadataId } from '../../metadata/id';

/**
 * @public
 */
@target.decorateSelf([Type.Class])
class Target extends Metadata {
  static Type = Type;

  value: Type[];
}

defineMetadataId(Target);
export default Target;
