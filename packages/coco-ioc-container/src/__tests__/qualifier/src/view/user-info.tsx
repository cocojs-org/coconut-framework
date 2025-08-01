import { autowired, view } from 'coco-mvc';
import Parent from '../component/parent.ts';

@view()
class UserInfo {
  @autowired()
  parent: Parent;
}

export default UserInfo;
