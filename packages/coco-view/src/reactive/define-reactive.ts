import Publisher from './publisher.ts';
import Subscriber from './subscriber.ts';

interface IGetter {
    (): any;
}
interface ISetter {
    (object: Record<any, any>, field: string, newValue: any): void;
}
// TODO: props也使用此函数进行响应式
function defineReactive(object: Record<any, any>, field: string, getter: IGetter, setter?: ISetter) {
    const publisher = new Publisher();
    Object.defineProperty(object, field, {
        configurable: false,
        enumerable: true,
        get: function () {
            if (Subscriber.Executing) {
                Subscriber.Executing.subscribe(publisher);
            }
            return getter();
        },
        set(newValue: any): boolean {
            const value = getter();
            if (value === newValue || (newValue !== newValue && value !== value)) {
                return true;
            }
            publisher.notify();
            setter?.(object, field, newValue);
            return true;
        },
    });
}

export { defineReactive };
