import { Plugin, PluginContext } from 'rollup';
import { compileOneFile } from 'coco-compiler';

interface PluginOption {
    // id统一前缀
    idPrefix?: string;
}

// 定义 Class Visitor 的类型
export default function addStaticIdPlugin({ idPrefix }: PluginOption = {}): Plugin {
    return {
        name: 'rollup-plugin-coco-compiler',
        transform(this: PluginContext, code, id) {
            try {
                return compileOneFile(code, id, idPrefix);
            } catch (e: any) {
                this.error(e.message);
            }
        },
    };
}
