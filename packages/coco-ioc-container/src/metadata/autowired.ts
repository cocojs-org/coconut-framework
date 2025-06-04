import Target from './target.ts';
import target from '../decorator/target.ts';
import Metadata from './abstract/metadata.ts';
import type Application from '../ioc-container/application.ts';

/**
 * @public
 */
@target([Target.Type.Field])
class Autowired extends Metadata {
  value: Class<any>;

  static postConstruct(
    metadata: Autowired,
    application: Application,
    name: string
  ) {
    this[name] = application.getComponentForAutowired(
      metadata.value,
      this.constructor as Class<any>,
      name
    );
  }
}

export default Autowired;
