import { component } from 'coco-mvc';
import a from '../decorator/a.ts';
import b from '../decorator/b.ts';

@component()
class Button {
  @a()
  @b()
  count;
}

export default Button;
