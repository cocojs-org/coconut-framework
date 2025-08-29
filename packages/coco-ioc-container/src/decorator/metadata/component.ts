import Metadata from './abstract/metadata';
import Target from './target';
import target from '../target';
import { register, NAME } from 'shared';

/**
 * @public
 */
export enum Scope {
  // 单例模式
  Singleton = 0,
  // 每次new新实例
  Prototype = 1,
}

/**
 * @public
 */
@target([Target.Type.Class, Target.Type.Method])
class Component extends Metadata {
  static Scope = Scope;

  scope: Scope = Scope.Singleton;
}

export default Component;
register(NAME.Component, Component);
