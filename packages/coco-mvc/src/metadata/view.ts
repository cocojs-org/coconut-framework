import {
  Metadata,
  component,
  Component,
  target,
  Target,
} from 'coco-ioc-container';
import { ReactNoopUpdateQueue } from 'react';

/**
 * @public
 */
@target([Target.Type.Class])
@component(Component.Scope.Prototype)
class View extends Metadata {
  // 当@view作为类装饰时，下面的函数将修改被装饰器的prototype
  static classDecoratorModifyPrototype(prototype: any) {
    if (!prototype) {
      prototype.updater = ReactNoopUpdateQueue;
    }
  }
}

export default View;
