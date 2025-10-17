import { Metadata, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Ref')
@target([Target.Type.Field])
class Ref extends Metadata {}

export default Ref;
