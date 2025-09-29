import Metadata from '../../metadata/metadata';
import Target from './target';
import target from '../target';
import { register, NAME } from 'shared';

/**
 * @public
 */
// @scope(SCOPE.Singleton) 这里暂时不添加scope装饰器了，因为不设置默认就是singleton，还可以避免 scope <-> target 循环依赖的问题
@target([Target.Type.Class, Target.Type.Method])
class Component extends Metadata {
  value?: Class<any>;
}

export default Component;
register(NAME.Component, Component); // TODO: 是否可以删除
