import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
class Route extends Metadata {
  value: string;
}

assignMetadataId(Route);
export default Route;
