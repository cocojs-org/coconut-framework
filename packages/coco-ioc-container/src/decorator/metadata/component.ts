import Metadata from '../../metadata/create-metadata';
import Target from './target';
import target from '../target';

/**
 * Component不添加@scope(SCOPE.Singleton)的原因：
 * 因为不设置默认就是singleton，还可以避免 scope <-> target 循环依赖的问题
 */
/**
 * @public
 */
@target([Target.Type.Class, Target.Type.Method])
class Component extends Metadata {
  value?: Class<any>;
}

export default Component;
