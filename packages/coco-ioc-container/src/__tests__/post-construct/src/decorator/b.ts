import { Metadata, createDecoratorExp } from 'coco-mvc';
import { mockFn } from '../../post-construct.test';

class B extends Metadata {
  static postConstruct() {
    mockFn('b');
  }
}

export default createDecoratorExp(B);
