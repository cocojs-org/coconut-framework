import { Metadata, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Bind')
@target([Target.Type.Method])
class Bind extends Metadata {}

export default Bind;
