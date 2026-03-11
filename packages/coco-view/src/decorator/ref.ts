import { createDecoratorExp, type Decorator, type Application } from 'coco-ioc-container';
import Ref from './metadata/ref';

export default createDecoratorExp(Ref, {
    componentPostConstruct: function (metadata: Ref, application: Application, target?: { name: string }) {
        const { name } = target;
        this[name] = { current: null };
    },
}) as () => Decorator<ClassFieldDecoratorContext>;
