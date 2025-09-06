import { Metadata, target, Target } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@target([Target.Type.Class])
@util()
class Document extends Metadata {}

export default Document;
