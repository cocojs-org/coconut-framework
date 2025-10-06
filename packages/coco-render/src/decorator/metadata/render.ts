import {
  Metadata,
  component,
  target,
  Target,
  assignMetadataId,
} from 'coco-ioc-container';

@target([Target.Type.Class])
@component()
class Render extends Metadata {}

assignMetadataId(Render);
export default Render;
