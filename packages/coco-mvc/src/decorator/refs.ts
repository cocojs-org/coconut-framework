import { createDecoratorExp, type Decorator, type Application } from 'coco-ioc-container';
import Refs from './metadata/refs';

export default createDecoratorExp(Refs, {
    componentPostConstruct: function (metadata: Refs, application: Application, field?: string) {
        this[field] = {};
    },
}) as () => Decorator<ClassFieldDecoratorContext>;
