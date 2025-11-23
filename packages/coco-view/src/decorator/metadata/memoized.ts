import { Metadata, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Memoized')
@target([Target.Type.Method])
class Memoized extends Metadata {}

export default Memoized;
