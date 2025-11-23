import { Metadata, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Refs')
@target([Target.Type.Field])
class Refs extends Metadata {}

export default Refs;
