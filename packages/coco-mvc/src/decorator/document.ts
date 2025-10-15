import { createDecoratorExp, Decorator } from 'coco-ioc-container';
import Document from './metadata/document';

export default createDecoratorExp(Document) as () => Decorator<ClassDecoratorContext>;
