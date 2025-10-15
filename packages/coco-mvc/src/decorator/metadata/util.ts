import { Metadata, component, Component, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class Util extends Metadata {}

defineMetadataId(Util);
export default Util;
