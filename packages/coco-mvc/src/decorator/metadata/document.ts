import { Metadata, target, Target, id } from 'coco-ioc-container';
import util from '../util';

/**
 * @public
 */
@id('Document')
@target([Target.Type.Class])
@util()
class Document extends Metadata {}

export default Document;
