import { Metadata, target, Target, configuration, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('WebApplication')
@target([Target.Type.Class])
@configuration()
class WebApplication extends Metadata {}

export default WebApplication;
