import { component, Metadata, Target, target, defineMetadataId } from 'coco-ioc-container';

@target([Target.Type.Class])
@component()
class Router extends Metadata {}

defineMetadataId(Router);
export default Router;
