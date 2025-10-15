import { Metadata, component, Component, target, Target, defineMetadataId } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class GlobalData extends Metadata {}

defineMetadataId(GlobalData);
export default GlobalData;
