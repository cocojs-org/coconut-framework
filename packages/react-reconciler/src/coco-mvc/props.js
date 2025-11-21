/**
 * 视图组件的props
 */
import { defineReactive } from 'coco-view';

const NoReactiveProps = ['children'];

function initProps(instance, newProps) {
    // TODO: 添加 props 相关测试用例
    instance.props = newProps;
    const _values = {};
    for (const field of Object.keys(newProps)) {
        if (NoReactiveProps.indexOf(field) !== -1) {
            continue;
        }
        _values[field] = newProps[field];
        const getter = () => _values[field];
        const setter = (object, key, newValue) => {
            _values[field] = newValue;
        };
        defineReactive(instance.props, field, getter, setter);
    }
}

function updateProps(instance, newProps) {
    for (const field of Object.keys(newProps)) {
        instance.props[field] = newProps[field];
    }
}

export { initProps, updateProps };
