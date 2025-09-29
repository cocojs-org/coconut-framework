/**
 * ioc组件，只有ioc组件才能实例化
 * 被@component装饰的组件是ioc组件，被@component装饰的元数据类对应的装饰器装饰的组件也是ioc组件
 */
import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';
import Component from './metadata/component';

export default createDecoratorExp(Component) as (
  value?: Class<any>
) => Decorator<ClassDecoratorContext | ClassMethodDecoratorContext>;
