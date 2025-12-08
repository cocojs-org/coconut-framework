import { Metadata, component, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class Util extends Metadata {}

export default Util;
