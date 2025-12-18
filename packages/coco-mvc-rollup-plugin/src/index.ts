import { Plugin, PluginContext } from 'rollup';
import { createTransformer } from 'assign-class-id-transformer';

interface PluginOption {
    // id统一前缀
    idPrefix?: string;
}

// 定义 Class Visitor 的类型
export default function addStaticIdPlugin({ idPrefix }: PluginOption = {}): Plugin {
    return {
        name: 'rollup-plugin-assign-class-id',
        transform(this: PluginContext, code, id) {
            const handler = createTransformer(this.warn, this.error, idPrefix);
            return handler(code, id);
        },
    };
}