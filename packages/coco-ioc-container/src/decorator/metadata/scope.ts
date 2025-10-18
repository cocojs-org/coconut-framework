import Target from './target';
import target from '../target';
import Metadata from '../../metadata/instantiate-one-metadata';
import id from '../id';

/**
 * @public
 */
export enum SCOPE {
    // 单例模式
    Singleton = 0,
    // 多例模式：每次new新实例
    Prototype = 1,
}

/**
 * @public
 */
@id('Scope')
@target([Target.Type.Class, Target.Type.Method])
class Scope extends Metadata {
    value: SCOPE = SCOPE.Singleton;
}

export default Scope;
