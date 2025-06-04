import { Metadata, target, Target, type Application } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Ref extends Metadata {
  static postConstruct(metadata: Ref, application: Application, name: string) {
    this[name] = { current: null };
  }
}

export default Ref;
