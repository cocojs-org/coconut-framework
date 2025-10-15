import { Metadata, target, Target, configuration, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@configuration()
class WebApplication extends Metadata {}

defineMetadataId(WebApplication);
export default WebApplication;
