import { isPlainObject } from '../share/util';

const defaultProp = 'value';
/**
 * 元信息基类
 * @public
 */
export default abstract class Metadata {}

export function createMetadata(metadataCls: Class<Metadata>, args?: any): Metadata {
    const metadata = new metadataCls();
    if (isPlainObject(args)) {
        /**
         * 使用装饰器第一个参数是对象，那么getOwnPropertyNames返回的所有prop，通过浅拷贝赋值
         * 例如：
         * @person({
         *   value: { name: '张三' },
         *   habit: ['打篮球', '打游戏']
         * })
         * 对应元数据
         * {
         *   value: { name: '张三' },
         *   habit: ['打篮球', '打游戏']
         * }
         */
        for (const key of Object.getOwnPropertyNames(args)) {
            metadata[key] = args[key];
        }
    } else if (args !== undefined) {
        /**
         * 使用装饰器第一个参数不是对象（例如：基础数据类型或数组），则使用单属性赋值：
         * 如果getOwnPropertyNames返回非空数组，则赋值给第一个prop；空数组就赋值给prop为'value'。
         * 举例：
         * 装饰器这样使用：@person('张三')
         ** 如果元数据定义如下：
         * class Person extends Metadata {
         *   name: string = undefined; // 如果希望getOwnPropertyNames返回非空数组，需要在定义field时赋初始值
         * }
         * 则生成的元数据为：
         * {
         *   name: '张三'
         * }
         ** 如果元数据定义如下：
         * class Person extends Metadata {}
         * 则生成的元数据为：
         * {
         *   value: '张三'
         * }
         */
        const keys = Object.getOwnPropertyNames(metadata);
        const propName = keys.length ? keys[0] : defaultProp;
        (metadata as any)[propName] = args;
    }
    return metadata;
}

export type MetadataClass = Class<Metadata>;
