import { component, Component } from 'coco-mvc';
import a from '../decorator/a.ts';
import b from '../decorator/b.ts';

@a()
@b()
@component(Component.Scope.Singleton)
class Button {}

export default Button;
