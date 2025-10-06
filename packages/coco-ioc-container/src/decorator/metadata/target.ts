import Metadata from '../../metadata/create-metadata';
import target, { Type } from '../target';
import { assignMetadataId } from '../../metadata/id';

/**
 * @public
 */
@target.decorateSelf([Type.Class])
class Target extends Metadata {
  static Type = Type;

  value: Type[];
}

assignMetadataId(Target);
export default Target;
