import { Metadata, target, Target, id } from 'coco-mvc';

@id('Log')
@target([Target.Type.Method])
class Log extends Metadata {}

export default Log;
