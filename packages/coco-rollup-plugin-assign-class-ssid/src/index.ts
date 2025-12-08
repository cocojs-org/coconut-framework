import { Plugin, PluginContext } from 'rollup';
import { createTransformer } from 'assign-class-ssid-transformer';

// 定义 Class Visitor 的类型
export default function addStaticIdPlugin(): Plugin {
    return {
        name: 'rollup-plugin-assign-class-ssid',
        transform(this: PluginContext, code, id) {
            const handler = createTransformer(this.warn, this.error);
            return handler(code, id);
        }
    };
}