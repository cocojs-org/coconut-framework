import { Metadata, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Class])
class Route extends Metadata {
    value: string;
}

export default Route;
