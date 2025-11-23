import { Metadata, component, Component, SCOPE, scope, target, Target, id } from 'coco-ioc-container';
import { ReactNoopUpdateQueue } from 'react';

/**
 * @public
 */
@id('View')
@target([Target.Type.Class])
@scope(SCOPE.Prototype)
@component()
class View extends Metadata {
    // 当@view作为类装饰时，下面的函数将修改被装饰器的prototype
    // TODO: View的复合装饰器也要支持的吧
    static classDecoratorModifyPrototype(prototype: any) {
        if (!prototype) {
            prototype.updater = ReactNoopUpdateQueue;
        }
    }
}

export default View;
