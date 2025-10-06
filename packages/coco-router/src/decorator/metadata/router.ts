import {
  component,
  Metadata,
  Target,
  target,
  assignMetadataId,
} from 'coco-ioc-container';

@target([Target.Type.Class])
@component()
class Router extends Metadata {}

assignMetadataId(Router);
export default Router;
