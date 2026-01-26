import { Plugin, PluginContext } from 'rollup';
import { compileOneFile } from '@cocojs/compiler';

interface PluginOption {
    // id统一前缀
    idPrefix?: string;
}

function cocoMvcPlugin({ idPrefix }: PluginOption = {}): Plugin {
    return {
        name: 'rollup-plugin-coco-mvc',
        transform(this: PluginContext, code, id) {
            try {
                const output = compileOneFile(code, id, idPrefix);
                return output;
            } catch (e: any) {
                this.error(e.message);
            }
        },
    };
}

export { PluginOption }
export default cocoMvcPlugin;
