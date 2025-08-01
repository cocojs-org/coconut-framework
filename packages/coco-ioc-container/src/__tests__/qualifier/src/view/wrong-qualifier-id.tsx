import { autowired, view, qualifier } from 'coco-mvc';
import Parent from '../component/parent.ts';

@view()
class WrongQualifierId {
  @qualifier('hhhh')
  @autowired()
  parent: Parent;
}

export default WrongQualifierId;
