import {
  Metadata,
  target,
  Target,
  configuration,
  assignMetadataId,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@configuration()
class WebApplication extends Metadata {}

assignMetadataId(WebApplication);
export default WebApplication;
