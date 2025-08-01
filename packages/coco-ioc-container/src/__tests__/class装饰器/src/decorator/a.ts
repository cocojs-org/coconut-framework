import { createDecoratorExp, Metadata } from 'coco-mvc';

class A extends Metadata {}
export default createDecoratorExp(A);
export const decoratorName = 'a';
