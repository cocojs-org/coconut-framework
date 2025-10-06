import {
  Metadata,
  component,
  target,
  Target,
  type Application,
  assignMetadataId,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class Store extends Metadata {}

assignMetadataId(Store);
export default Store;
