import { Metadata, component, target, Target } from 'coco-ioc-container';

// TODO: view 包添加 viewData装饰器
/**
 * @public
 */
@target([Target.Type.Class])
@component()
class GlobalData extends Metadata {}

export default GlobalData;
