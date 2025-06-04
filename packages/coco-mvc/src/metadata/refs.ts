import { Metadata, target, Target, type Application } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Field])
class Refs extends Metadata {
  static postConstruct(metadata: Refs, application: Application, name: string) {
    this[name] = {};
  }
}

export default Refs;
