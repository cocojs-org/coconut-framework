import { Metadata, createDecoratorExp } from 'coco-mvc';
import { mockFn } from '../../post-construct.test';

class A extends Metadata {
  static postConstruct() {
    mockFn('a');
  }
}

export default createDecoratorExp(A);
