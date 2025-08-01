import { autowired, view } from 'coco-mvc';
import Button from './button.tsx';
import Theme from '../component/theme.ts';
import User from '../component/user.ts';
import Computer from '../component/computer.ts';

@view()
class UserInfo {
  @autowired()
  button: Button;

  @autowired()
  theme: Theme;

  @autowired()
  user: User;

  @autowired()
  computer: Computer;
}

export default UserInfo;
