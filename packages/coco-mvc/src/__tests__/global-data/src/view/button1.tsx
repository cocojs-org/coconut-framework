import { view, reactive, bind, autowired } from 'coco-mvc';
import Login from '../global-data/login.ts';

@view()
class Button1 {
  @autowired()
  login: Login;

  render() {
    return <button>btn-1</button>;
  }
}

export default Button1;
