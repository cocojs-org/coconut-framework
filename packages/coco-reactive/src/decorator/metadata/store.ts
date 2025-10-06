import {
  Metadata,
  component,
  target,
  Target,
  type Application,
  defineMetadataId,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class Store extends Metadata {}

defineMetadataId(Store);
export default Store;
