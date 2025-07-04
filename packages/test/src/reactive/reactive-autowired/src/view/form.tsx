import { view, bind, reactiveAutowired, memoized } from 'coco-mvc';
import UserInfo from '../store/user-info.ts';

@view()
class Form {
  @reactiveAutowired()
  userInfo: UserInfo;

  label() {
    return `input:${this.userInfo.name}`;
  }

  @bind()
  handleClick() {
    this.userInfo = { name: '李四' };
  }

  render() {
    return (
      <button onClick={this.handleClick}>input:{this.userInfo.name}</button>
    );
  }
}

export default Form;
