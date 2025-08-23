import { Metadata, target, Target, type Application } from 'coco-ioc-container';
import Remote from '../reactive-autowired/remote';
import { customPostConstruct } from './reactive';

/**
 * @public
 */
@target([Target.Type.Field])
class ReactiveAutowired extends Metadata {
  value: Function;

  static postConstruct(
    metadata: ReactiveAutowired,
    application: Application,
    name: string
  ) {
    const cls: any = metadata.value;
    this[name] = application.getComponent(cls);
  }
}

export default ReactiveAutowired;
