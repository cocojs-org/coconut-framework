import { Metadata, component, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Util')
@target([Target.Type.Class])
@component()
class Util extends Metadata {}

export default Util;
