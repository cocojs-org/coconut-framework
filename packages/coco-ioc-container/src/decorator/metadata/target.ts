import Metadata from '../../metadata/instantiate-one-metadata';
import target, { Type } from '../target';
import id from '../id';

/**
 * @public
 */
@id('Target')
@target.decorateSelf([Type.Class])
class Target extends Metadata {
    static Type = Type;

    value: Type[];
}

export default Target;
