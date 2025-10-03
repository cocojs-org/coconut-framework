import {
  Metadata,
  component,
  SCOPE,
  scope,
  target,
  Target,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
@scope(SCOPE.Prototype)
class Effect extends Metadata {}

export default Effect;
