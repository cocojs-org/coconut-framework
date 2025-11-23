import { Metadata, target, Target, id } from 'coco-ioc-container';

/**
 * @public
 */
@id('Route')
@target([Target.Type.Class])
class Route extends Metadata {
    value: string;
}

export default Route;
