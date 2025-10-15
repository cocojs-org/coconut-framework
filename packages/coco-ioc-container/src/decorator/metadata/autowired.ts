import Target from './target';
import target from '../target';
import Metadata from '../../metadata/create-metadata';
import { defineMetadataId } from '../../metadata/id';

/**
 * @public
 */
@target([Target.Type.Field])
class Autowired extends Metadata {
    value: Class<any>;
}

defineMetadataId(Autowired);
export default Autowired;
