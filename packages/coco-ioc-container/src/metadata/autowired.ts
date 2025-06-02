import Target from './target.ts';
import target from '../decorator/target.ts';
import Metadata from './abstract/metadata.ts';
import type ApplicationContext from '../ioc-container/application-context.ts';

/**
 * @public
 */
@target([Target.Type.Field])
class Autowired extends Metadata {
  value: Class<any>;

  static postConstruct(
    metadata: Autowired,
    appCtx: ApplicationContext,
    name: string
  ) {
    this[name] = appCtx.getComponentForAutowired(
      metadata.value,
      this.constructor as Class<any>,
      name
    );
  }
}

export default Autowired;
