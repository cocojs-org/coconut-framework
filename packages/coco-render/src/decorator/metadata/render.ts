import {
  Metadata,
  component,
  Component,
  target,
  Target,
} from 'coco-ioc-container';

@target([Target.Type.Class])
@component(Component.Scope.Singleton)
class Render extends Metadata {}

export default Render;
