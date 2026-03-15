import { createDecoratorExp, type Application, type Decorator } from 'coco-ioc-container';
import Reactive from './metadata/reactive';
import { reactiveAssignField } from 'shared';
import { definePublisher } from '../memoized/define-publisher.ts';

export default createDecoratorExp(Reactive, {
    componentPostConstruct(metadata: Reactive, application: Application, target: { name: string }) {
        const { name } = target;
        // TODO: 限制只能在store或view组件内部
        let value: any = this[name];
        definePublisher(
            this,
            name,
            function getter() {
                return value;
            },
            function setter(object: any, field: string, newValue: any) {
                object.updater.enqueueSetState(object, field, newValue);
            }
        );

        Object.defineProperty(this, reactiveAssignField(name), {
            configurable: false,
            enumerable: false,
            set(v: any): boolean {
                value = v;
                return true;
            },
        });
    },
}) as () => Decorator<ClassFieldDecoratorContext | ClassDecoratorContext>;
