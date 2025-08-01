import { component } from 'coco-mvc';
import a from '../decorator/a.ts';
import b from '../decorator/b.ts';

@a()
@b()
@component()
class Button {}

export default Button;
