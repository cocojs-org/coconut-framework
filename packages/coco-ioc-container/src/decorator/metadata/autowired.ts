import Target from './target';
import target from '../target';
import Metadata from '../../metadata/create-metadata';
import { assignMetadataId } from '../../metadata/id';

/**
 * @public
 */
@target([Target.Type.Field])
class Autowired extends Metadata {
  value: Class<any>;
}

assignMetadataId(Autowired);
export default Autowired;
