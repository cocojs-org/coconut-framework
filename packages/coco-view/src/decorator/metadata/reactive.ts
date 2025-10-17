import { Metadata, target, Target, id } from 'coco-ioc-container';

/**
 * 加在field表明是响应式
 * 加在metadata上用于自定义reactive元数据
 * @public
 */
@id('Reactive')
@target([Target.Type.Field, Target.Type.Class])
class Reactive extends Metadata {}

export default Reactive;
