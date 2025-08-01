import { component, Component, webApplication } from 'coco-mvc';
import User from './component/user.ts';
import Computer from './component/computer.ts';

@webApplication()
class Application {
  @component()
  user() {
    return new User();
  }

  @component(Component.Scope.Prototype)
  computer() {
    return new Computer();
  }
}

export default Application;
