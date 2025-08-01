import { createDecoratorExp, Metadata } from 'coco-mvc';

class B extends Metadata {}
export default createDecoratorExp(B);
export const decoratorName = 'b';
