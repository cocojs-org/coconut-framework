import type Publisher from './publisher';

class Subscriber {
    static Executing: Subscriber;

    private isDirty = true;

    private publishers: Publisher[] = [];

    // 组件方法，且绑定了fn对应的this
    private readonly fn: Function;

    private value: any;

    constructor(bindThisFn: Function) {
        this.fn = bindThisFn;
    }

    subscribe = (publisher: Publisher) => {
        if (this.publishers.indexOf(publisher) === -1) {
            publisher.addListener(this);
            this.publishers.push(publisher);
        } else {
            // 可能存在一个memoized函数中多次访问reactive变量的情况的
        }
    };

    // **必须是field，绑定当前this对象**
    memoizedFn = () => {
        if (this.isDirty) {
            {
                // clear
                for (const pub of this.publishers) {
                    pub.removeListener(this);
                }
                this.publishers = [];
            }

            {
                const childSubscriber = Subscriber.Executing;
                Subscriber.Executing = this;
                this.value = this.fn();
                Subscriber.Executing = childSubscriber;
                if (childSubscriber) {
                    this.publishers.forEach(childSubscriber.subscribe);
                }
            }
            this.isDirty = false;
        }
        return this.value;
    };

    public dirty() {
        this.isDirty = true;
    }
}

export default Subscriber;
