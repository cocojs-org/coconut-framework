import { Plugin, PluginContext } from 'rollup';
import { createTransformer } from 'assign-class-id-transformer';

interface PluginOption {
    // 前缀，最终添加的$cocoId的值为`${prefix.trim()}${class.name}`
    prefix?: string;
}

// 定义 Class Visitor 的类型
export default function addStaticIdPlugin({ prefix }: PluginOption = {}): Plugin {
    return {
        name: 'rollup-plugin-assign-class-ssid',
        transform(this: PluginContext, code, id) {
            const handler = createTransformer(this.warn, this.error, prefix);
            return handler(code, id);
        },
    };
}