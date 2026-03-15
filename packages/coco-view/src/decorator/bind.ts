import { createDecoratorExp, type Decorator, type Application } from 'coco-ioc-container';
import Bind from './metadata/bind';

export default createDecoratorExp(Bind, {
    componentPostConstruct: function (metadata: Bind, application: Application, target?: { name: string }) {
        const { name } = target;
        this[name] = this[name].bind(this);
    },
}) as () => Decorator<ClassMethodDecoratorContext>;
