import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Page from './metadata/page';

export default createDecoratorExp(Page) as () => Decorator<ClassDecoratorContext>;
