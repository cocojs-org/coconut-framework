import { createDecoratorExp, type Application, type Decorator } from 'coco-ioc-container';
import Reactive from './metadata/reactive';
import { reactiveAssignField } from 'shared';
import { defineReactive } from '../reactive/define-reactive.ts';

export default createDecoratorExp(Reactive, {
    componentPostConstruct(metadata: Reactive, application: Application, name: string) {
        // TODO: 限制只能在store或view组件内部
        let value: any = this[name];
        const setter = (object: any, field: string, newValue: any) => {
            object.updater.enqueueSetState(object, field, newValue);
        }
        const getter = () => value;
        Object.defineProperty(this, reactiveAssignField(name), {
            configurable: false,
            enumerable: false,
            set(v: any): boolean {
                value = v;
                return true;
            },
        });

        defineReactive(this, name, getter, setter);
    },
}) as () => Decorator<ClassFieldDecoratorContext | ClassDecoratorContext>;
