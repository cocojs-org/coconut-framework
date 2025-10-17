import { createPlaceholderDecoratorExp, DecoratorExpWithDecoratorSelf } from '../create-decorator-exp';

/**
 * @public
 * @id()装饰器
 * 用于为元数据类或者组件类设置id，id的作用是可以根据id返回元数据类，也可以根据id实例化组件，所以id必须要唯一。
 * 如果一个组件不添加id装饰器，那么组件或者元数据类的id就是class.name（rollup和webpack目前打包不会压缩class关键字）
 * 如果用户显式设置了id装饰器，那么会使用用户设置的id
 */
const id: DecoratorExpWithDecoratorSelf<string> = createPlaceholderDecoratorExp();

export default id;
