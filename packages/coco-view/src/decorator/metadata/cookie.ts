import { Metadata, target, Target, id, component } from 'coco-ioc-container';

/**
 * @public
 */
@id('Cookie')
@target([Target.Type.Class])
@component()
class Cookie extends Metadata {}

export default Cookie;
