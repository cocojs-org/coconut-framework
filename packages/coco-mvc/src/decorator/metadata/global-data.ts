import { Metadata, component, id, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@id('GlobalData')
@target([Target.Type.Class])
@component()
class GlobalData extends Metadata {}

export default GlobalData;
