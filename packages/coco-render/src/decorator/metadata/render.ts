import {
  Metadata,
  component,
  target,
  Target,
  defineMetadataId,
} from 'coco-ioc-container';

@target([Target.Type.Class])
@component()
class Render extends Metadata {}

defineMetadataId(Render);
export default Render;
