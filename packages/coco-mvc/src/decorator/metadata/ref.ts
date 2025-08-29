import { Metadata, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Ref extends Metadata {}

export default Ref;
