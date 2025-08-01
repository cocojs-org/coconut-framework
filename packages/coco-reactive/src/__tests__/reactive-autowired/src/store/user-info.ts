import { reactive, store } from 'coco-mvc';

@store()
class UserInfo {
  name: string = '张三';
}

export default UserInfo;
