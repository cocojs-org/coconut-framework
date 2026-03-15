import { createDecoratorExp, type Decorator, type Application } from 'coco-ioc-container';
import Refs from './metadata/refs';

export default createDecoratorExp(Refs, {
    componentPostConstruct: function (metadata: Refs, application: Application, target?: {name: string}) {
        this[target.name] = {};
    },
}) as () => Decorator<ClassFieldDecoratorContext>;
