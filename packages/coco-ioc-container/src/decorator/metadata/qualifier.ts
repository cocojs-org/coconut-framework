import Target from './target';
import target from '../target';
import Metadata from '../../metadata/create-metadata';
import { assignMetadataId } from '../../metadata/id';

/**
 * @public
 */
@target([Target.Type.Field])
class Qualifier extends Metadata {
  value: string;
}

assignMetadataId(Qualifier);
export default Qualifier;
