import Target from './target';
import target from '../decorator/target';
import Metadata from './abstract/metadata';

/**
 * @public
 */
@target([Target.Type.Method])
class Start extends Metadata {
  value: Class<any>[];
}

export default Start;
