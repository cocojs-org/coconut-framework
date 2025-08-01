import { view, reactive, bind, reactiveAutowired } from 'coco-mvc';
import UserInfo from '../store/user-info.ts';

@view()
class Detail2 {
  @reactiveAutowired()
  userInfo: UserInfo;

  label() {
    return `展示:${this.userInfo?.name}`;
  }

  render() {
    return <h1>展示:{this.userInfo?.name}</h1>;
  }
}

export default Detail2;
