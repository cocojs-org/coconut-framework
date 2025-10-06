import { Metadata, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method])
class Bind extends Metadata {}

defineMetadataId(Bind);
export default Bind;
