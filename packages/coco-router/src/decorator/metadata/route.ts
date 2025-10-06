import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
class Route extends Metadata {
  value: string;
}

defineMetadataId(Route);
export default Route;
