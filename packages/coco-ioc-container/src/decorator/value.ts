import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';
import Value from './metadata/value';
import type Application from '../ioc-container/application';

export default createDecoratorExp(Value, {
  postConstruct: function (
    metadata: Value,
    application: Application,
    field?: string
  ) {
    const path = metadata.value;
    if (typeof path !== 'string' || !path.trim()) {
      return;
    }
    this[field] = application.propertiesConfig.getValue(path);
  },
}) as (path: string) => Decorator<ClassFieldDecoratorContext>;
