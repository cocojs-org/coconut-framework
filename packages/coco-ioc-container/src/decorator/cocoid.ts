/**
 * @cocoid装饰器
 * 在使用@component方法装饰注入的普通类，必须使用@cocoid来申明组件的cocoid
 */
import { createDecoratorExp, type Decorator } from '../create-decorator-exp';
import Cocoid from './metadata/cocoid';

export default createDecoratorExp(Cocoid) as (
    cocoid: string
) => Decorator<ClassMethodDecoratorContext>;
