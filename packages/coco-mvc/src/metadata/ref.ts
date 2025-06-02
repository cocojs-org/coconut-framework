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
class Ref extends Metadata {
  static postConstruct(
    metadata: Ref,
    appCtx: ApplicationContext,
    name: string
  ) {
    this[name] = { current: null };
  }
}

export default Ref;
