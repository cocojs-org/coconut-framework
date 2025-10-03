import { createDecoratorExp, type Decorator } from '../create-decorator-exp';
import Value from './metadata/value';
import type Application from '../application';

export default createDecoratorExp(Value, {
  componentPostConstruct: function (
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
