import { component, Metadata, Target, target, id } from 'coco-ioc-container';

@id('Router')
@target([Target.Type.Class])
@component()
class Router extends Metadata {}

export default Router;
