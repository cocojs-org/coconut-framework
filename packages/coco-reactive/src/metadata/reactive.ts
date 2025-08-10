import { type Application, Metadata, target, Target } from 'coco-ioc-container';
import Publisher from '../memoized/publisher';
import Subscriber from '../memoized/subscriber';
import { get, NAME } from 'shared';

export function customPostConstruct(hooks?: {
  /**
   * 自定义初始化工作，返回值作为参数传递给其他的hook
   */
  init?: (
    metadata: Reactive,
    application: Application,
    name: string,
    enqueueSetState: (v: any) => void
  ) => any;
  // 值的初始化
  initValue?: (initRtn: any) => any;
  // 在获取值之前
  preGetter?: (initRtn: any) => void;
  // 在排队操作之前
  preEnqueueSetUpdate?: (initRtn: any) => void;
  // 自定义的排队
  enqueueSetState?: (initRtn: any, v: any) => void;
}) {
  return function postConstruct(
    metadata: Reactive,
    application: Application,
    name: string
  ) {
    const enqueueSetState = (v: any) => {
      this.updater.enqueueSetState(this, name, v);
    };
    const initRtn = hooks?.init?.(metadata, application, name, enqueueSetState);
    let _value: any = hooks?.initValue ? hooks.initValue(initRtn) : this[name];
    const publisher = new Publisher(name);
    Object.defineProperty(this, name, {
      configurable: false,
      enumerable: true,
      get: function () {
        if (Subscriber.Executing) {
          Subscriber.Executing.subscribe(publisher);
        }
        hooks?.preGetter?.(initRtn);
        return _value;
      },
      set(v: any): boolean {
        if (get(NAME.isRenderPhase)?.()) {
          _value = v;
        } else {
          publisher.notify();
          hooks?.preEnqueueSetUpdate?.(initRtn);
          hooks?.enqueueSetState
            ? hooks.enqueueSetState(initRtn, v)
            : enqueueSetState(v);
        }
        return true;
      },
    });
  };
}
/**
 * 加在field表明是响应式
 * 加在metadata上用于自定义reactive元数据
 * @public
 */
@target([Target.Type.Field, Target.Type.Class])
class Reactive extends Metadata {
  static postConstruct = customPostConstruct();
}

export default Reactive;
