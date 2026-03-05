/**
 * definePublisher
 * 为对象的field关联一个publisher，更新的时候通知所有的subscribe过期。
 */
import Publisher from './publisher.ts';
import Subscriber from './subscriber.ts';

interface IGetter {
    (): any;
}
interface ISetter {
    (object: Record<any, any>, field: string, newValue: any): void;
}

function definePublisher(object: Record<any, any>, field: string, getter: IGetter, setter?: ISetter) {
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
            {
                // 这里不管setter函数做了什么，或者有没有做更新，我们都标记dirty，这是简单粗暴的做法
                publisher.dirty();
            }
            setter?.(object, field, newValue);
            return true;
        },
    });
}

export { definePublisher };
