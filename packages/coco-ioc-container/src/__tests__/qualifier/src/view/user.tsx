import { autowired, view, qualifier } from 'coco-mvc';
import Parent from '../component/parent.ts';

@view()
class User {
  @qualifier('Child')
  @autowired()
  parent: Parent;
}

export default User;
