import { component, Component, webApplication } from 'coco-mvc';
import User from './component/user.ts';
import Button from './component/button.ts';
import Theme from './component/theme.ts';

@webApplication()
class Application {
  @component()
  user() {
    return new User();
  }

  @component()
  theme() {
    return new Theme();
  }

  @component(Component.Scope.Prototype)
  button() {
    return new Button();
  }
}

export default Application;
