/**
 * @id装饰器
 * 在使用@component方法装饰注入的普通类，必须使用@id来申明组件的$$id
 */
import { createDecoratorExp, type Decorator } from '../create-decorator-exp';
import Id from './metadata/id';

export default createDecoratorExp(Id) as (
    id: string
) => Decorator<ClassMethodDecoratorContext>;
