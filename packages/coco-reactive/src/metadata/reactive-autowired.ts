import { Metadata, target, Target } from 'coco-ioc-container';
import reactive from '../decorator/reactive.ts';
import Remote from '../reactive-autowired/remote.ts';
import { customPostConstruct } from './reactive.ts';
import { sym_remote } from './store.ts';

/**
 * @public
 */
@reactive()
@target([Target.Type.Field])
class ReactiveAutowired extends Metadata {
  value: Function;

  static postConstruct = customPostConstruct({
    init: (metadata: ReactiveAutowired, appCtx, name, enqueueSetState) => {
      const cls: any = metadata.value;
      const remote: Remote = appCtx.getComponent(cls)[sym_remote];
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
