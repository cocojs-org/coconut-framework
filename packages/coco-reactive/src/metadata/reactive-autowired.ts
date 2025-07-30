import { Metadata, target, Target } from 'coco-ioc-container';
import reactive from '../decorator/reactive';
import Remote from '../reactive-autowired/remote';
import { customPostConstruct } from './reactive';
import { sym_remote } from './store';

/**
 * @public
 */
@reactive()
@target([Target.Type.Field])
class ReactiveAutowired extends Metadata {
  value: Function;

  static postConstruct = customPostConstruct({
    init: (metadata: ReactiveAutowired, application, name, enqueueSetState) => {
      const cls: any = metadata.value;
      const remote: Remote = application.getComponent(cls)[sym_remote];
      remote.fork().setEnqueueUpdate(enqueueSetState);
      return remote;
    },
    initValue: (remote: Remote) => {
      return remote.pull();
    },
    enqueueSetState(remote: Remote, v: any) {
      remote.push(v);
    },
  });
}

export default ReactiveAutowired;
