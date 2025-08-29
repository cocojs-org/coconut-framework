import Target from './target';
import target from '../target';
import Metadata from './abstract/metadata';

/**
 * @public
 */
@target([Target.Type.Method])
class Init extends Metadata {
  value: Class<any>[];
}

export default Init;
