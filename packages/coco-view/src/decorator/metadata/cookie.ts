import { Metadata, target, Target, component } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
@component()
class Cookie extends Metadata {}

export default Cookie;
