import Target from './target';
import target from '../decorator/target';
import Metadata from './abstract/metadata';
import type Application from '../ioc-container/application';

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
