import { Plugin, PluginContext } from 'rollup';
import { compileOneFile } from '@cocojs/compiler';

interface PluginOption {
    // id统一前缀
    idPrefix?: string;
}

// 不会插入 import { constructorParam } from 'xxxx' 的场景
function cocoMvcPluginForNoImport({ idPrefix }: PluginOption = {}): Plugin {
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

// 插入 import { constructorParam } from 'coco-ioc-container' 的场景
function cocoMvcPluginForCocoMvc({ idPrefix }: PluginOption = {}): Plugin {
    return {
        name: 'rollup-plugin-coco-mvc',
        transform(this: PluginContext, code, id) {
            try {
                const output = compileOneFile(code, id, idPrefix, 'coco-ioc-container');
                return output;
            } catch (e: any) {
                this.error(e.message);
            }
        },
    };
}

// 插入 import { constructorParam } from '@cocojs/mvc' 的场景
function cocoMvcPluginForThirdPartLib({ idPrefix }: PluginOption = {}): Plugin {
    return {
        name: 'rollup-plugin-coco-mvc',
        transform(this: PluginContext, code, id) {
            try {
                const output = compileOneFile(code, id, idPrefix, '@cocojs/mvc');
                return output;
            } catch (e: any) {
                this.error(e.message);
            }
        },
    };
}

export { PluginOption, cocoMvcPluginForNoImport, cocoMvcPluginForCocoMvc, cocoMvcPluginForThirdPartLib };
