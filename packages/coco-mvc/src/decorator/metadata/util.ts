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
class Util extends Metadata {}

assignMetadataId(Util);
export default Util;
