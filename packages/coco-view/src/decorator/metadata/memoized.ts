import { Metadata, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method, Target.Type.Field])
class Memoized extends Metadata {}

export default Memoized;
