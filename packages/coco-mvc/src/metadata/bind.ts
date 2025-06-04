import { type Application, Metadata, target, Target } from 'coco-ioc-container';

/**
 * @public
 */
@target([Target.Type.Method])
class Bind extends Metadata {
  static postConstruct(metadata: Bind, application: Application, name: string) {
    this[name] = this[name].bind(this);
  }
}

export default Bind;
