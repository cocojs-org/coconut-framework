import {
  Metadata,
  component,
  Component,
  target,
  Target,
  assignMetadataId,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class GlobalData extends Metadata {}

assignMetadataId(GlobalData);
export default GlobalData;
