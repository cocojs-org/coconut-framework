import { Metadata, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Refs extends Metadata {}

export default Refs;
