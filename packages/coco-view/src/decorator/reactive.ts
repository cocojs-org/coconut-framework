import { createDecoratorExp, type Application, type Decorator } from 'coco-ioc-container';
import Reactive from './metadata/reactive';
import { reactiveAssignField } from 'shared';
import { defineReactive } from '../reactive/define-reactive.ts';

export default createDecoratorExp(Reactive, {
    componentPostConstruct(metadata: Reactive, application: Application, name: string) {
        const Store: Class<any> = application.getMetaClassById('Store');
        const isStoreComponent = application.findClassKindMetadataRecursively(this.constructor, Store);
        let value: any = this[name];
        let setter;
        const getter = () => value;
        if (isStoreComponent) {
            // store 组件目前是直接赋值，然后走forceUpdate逻辑的
            setter = (object: any, key: string, newValue: any) => {
                value = newValue;
                object['storePublisher']?.broadcast();
            };
        } else {
            // 不是store组件目前可以都认为是视图组件，视图组件是走批量更新逻辑的
            setter = (object: any, field: string, newValue: any) =>
                object.updater.enqueueSetState(object, field, newValue);
            Object.defineProperty(this, reactiveAssignField(name), {
                configurable: false,
                enumerable: false,
                set(v: any): boolean {
                    value = v;
                    return true;
                },
            });
        }

        defineReactive(this, name, getter, setter);
    },
}) as () => Decorator<ClassFieldDecoratorContext | ClassDecoratorContext>;
