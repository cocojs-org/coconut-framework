import { component, Metadata, Target, target } from 'coco-ioc-container';

@target([Target.Type.Class])
@component()
class Router extends Metadata {}

export default Router;
