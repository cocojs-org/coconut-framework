import {
  Metadata,
  target,
  Target,
  type ApplicationContext,
} from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Refs extends Metadata {
  static postConstruct(
    metadata: Refs,
    appCtx: ApplicationContext,
    name: string
  ) {
    this[name] = {};
  }
}

export default Refs;
