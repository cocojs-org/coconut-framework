import Target from './target';
import target from '../target';
import Metadata from '../../metadata/create-metadata';
import { defineMetadataId } from '../../metadata/id';

/**
 * @public
 */
@target([Target.Type.Class])
class ConstructorParam extends Metadata {
  value: Class<any>[];
}

defineMetadataId(ConstructorParam);
export default ConstructorParam;
