import { createDecoratorExp, Decorator } from 'coco-ioc-container';
import Cookie from './metadata/cookie';

export default createDecoratorExp(Cookie) as () => Decorator<ClassDecoratorContext>;
