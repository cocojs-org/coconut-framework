import { Metadata, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method])
class Memoized extends Metadata {}

export default Memoized;
