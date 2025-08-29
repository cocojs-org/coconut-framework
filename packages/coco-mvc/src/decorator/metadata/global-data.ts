import {
  Metadata,
  component,
  Component,
  target,
  Target,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component(Component.Scope.Singleton)
class GlobalData extends Metadata {}

export default GlobalData;
