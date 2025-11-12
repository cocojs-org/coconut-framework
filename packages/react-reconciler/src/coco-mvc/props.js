/**
 * 视图组件的props
 */
import { Publisher, Subscriber } from 'coco-view';

const NoReactiveProps = ['children'];

function initProps(instance, newProps) {
    instance.props = newProps;
    const _values = {};
    for (const field of Object.keys(newProps)) {
        if (NoReactiveProps.indexOf(field) !== -1) {
            continue;
        }
        const publisher = new Publisher();
        _values[field] = newProps[field];
        // TODO: 和@memoized保持订阅关系，那么应该和@reactive采用一样的实现逻辑
        Object.defineProperty(instance.props, field, {
            configurable: false,
            enumerable: true,
            get: function () {
                if (Subscriber.Executing) {
                    Subscriber.Executing.subscribe(publisher);
                }
                return _values[field];
            },
            set(v) {
                if (_values[field] === v || (v !== v && _values[field] !== _values[field])) {
                    return true;
                }
                _values[field] = v;
                publisher.notify();
                return true;
            },
        });
    }
}

function updateProps(instance, newProps) {
    for (const field of Object.keys(newProps)) {
        instance.props[field] = newProps[field];
    }
}

export {
    initProps,
    updateProps,
}