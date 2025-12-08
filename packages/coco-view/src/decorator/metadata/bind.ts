import { Metadata, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method])
class Bind extends Metadata {}

export default Bind;
