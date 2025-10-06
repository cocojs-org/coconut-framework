import { Metadata, target, Target, assignMetadataId } from 'coco-ioc-container';

/**
 * 加在field表明是响应式
 * 加在metadata上用于自定义reactive元数据
 * @public
 */
@target([Target.Type.Field, Target.Type.Class])
class Reactive extends Metadata {}

assignMetadataId(Reactive);
export default Reactive;
