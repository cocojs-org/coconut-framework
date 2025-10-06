import {
  Metadata,
  component,
  SCOPE,
  scope,
  target,
  Target,
  assignMetadataId,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
@scope(SCOPE.Prototype)
class Effect extends Metadata {}

assignMetadataId(Effect);
export default Effect;
