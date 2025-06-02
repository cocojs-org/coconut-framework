import Target from './target.ts';
import target from '../decorator/target.ts';
import Metadata from './abstract/metadata.ts';
import type ApplicationContext from '../ioc-container/application-context.ts';

/**
 * @public
 */
@target([Target.Type.Field])
class Value extends Metadata {
  value: string;

  static postConstruct(
    metadata: Value,
    appCtx: ApplicationContext,
    name: string
  ) {
    const path = metadata.value;
    if (typeof path !== 'string' || !path.trim()) {
      return;
    }
    this[name] = appCtx.propertiesConfig.getValue(path);
  }
}

export default Value;
