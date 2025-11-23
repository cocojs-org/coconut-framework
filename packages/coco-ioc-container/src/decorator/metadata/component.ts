import Metadata from '../../metadata/instantiate-one-metadata';
import Target from './target';
import target from '../target';
import id from '../id';

/**
 * Component不添加@scope(SCOPE.Singleton)的原因：
 * 因为不设置默认就是singleton，还可以避免 scope <-> target 循环依赖的问题
 */
/**
 * @public
 */
@id('Component')
@target([Target.Type.Class, Target.Type.Method])
class Component extends Metadata {
    value?: Class<any>;
}

export default Component;
