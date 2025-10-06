import { Metadata, target, Target, defineMetadataId } from 'coco-mvc';

@target([Target.Type.Method])
class Log extends Metadata {}

defineMetadataId(Log);
export default Log;
