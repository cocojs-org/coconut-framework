import { configuration, component, Component } from 'coco-mvc';
import User from './user.ts';
import Button from './button.ts';
import Theme from './theme.ts';

@configuration()
class WebAppConfiguration {
  @component()
  router() {
    return new User();
  }

  @component(Component.Scope.Prototype)
  button() {
    return new Button();
  }

  @component()
  theme() {
    return new Theme();
  }
}

export default WebAppConfiguration;
