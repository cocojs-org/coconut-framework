import Target from './target.ts';
import target from '../decorator/target.ts';
import Metadata from './abstract/metadata.ts';
import type Application from '../ioc-container/application.ts';

/**
 * @public
 */
@target([Target.Type.Field])
class Value extends Metadata {
  value: string;

  static postConstruct(
    metadata: Value,
    application: Application,
    name: string
  ) {
    const path = metadata.value;
    if (typeof path !== 'string' || !path.trim()) {
      return;
    }
    this[name] = application.propertiesConfig.getValue(path);
  }
}

export default Value;
