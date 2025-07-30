import Target from './target';
import target from '../decorator/target';
import Metadata from './abstract/metadata';
import type Application from '../ioc-container/application';

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
