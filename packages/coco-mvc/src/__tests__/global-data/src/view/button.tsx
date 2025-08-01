import { view, reactive, bind, autowired } from 'coco-mvc';
import Login from '../global-data/login.ts';

@view()
class Button {
  @autowired()
  login: Login;

  render() {
    return <button>btn-0</button>;
  }
}

export default Button;
