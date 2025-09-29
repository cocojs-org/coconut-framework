import Target from './target';
import target from '../target';
import Metadata from '../../metadata/create-metadata';

/**
 * @public
 */
@target([Target.Type.Field])
class Qualifier extends Metadata {
  value: string;
}

export default Qualifier;
