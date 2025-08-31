import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';
import Autowired from './metadata/autowired';
import type Application from '../ioc-container/application';

// todo cls?: Class<any>如果去掉的话，在项目中会报错，应该是ts-server是拿到参数了，但是声明中确没有
export default createDecoratorExp(Autowired, {
  componentPostConstruct: function (
    metadata: Autowired,
    application: Application,
    field?: string
  ) {
    this[field] = application.getComponentForAutowired(
      metadata.value,
      this.constructor as Class<any>,
      field
    );
  },
}) as (cls?: Class<any>) => Decorator<ClassFieldDecoratorContext>;
