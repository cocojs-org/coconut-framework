import {
  component,
  Component,
  Metadata,
  Target,
  target,
} from 'coco-ioc-container';

@target([Target.Type.Class])
@component(Component.Scope.Singleton)
class Router extends Metadata {}

export default Router;
