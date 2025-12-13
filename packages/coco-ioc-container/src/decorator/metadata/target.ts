import Metadata from '../../metadata/instantiate-one-metadata';
import target, { Type } from '../target';

/**
 * @public
 */
@target.decorateSelf([Type.Class])
class Target extends Metadata {
    static Type = Type;

    value: Type[];
}

export default Target;
