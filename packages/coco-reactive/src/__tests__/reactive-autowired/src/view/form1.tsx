import { view, bind, reactiveAutowired, memoized, reactive } from 'coco-mvc';
import UserInfo from '../store/user-info.ts';

const memoizedFn = jest.fn();

@view()
class Form1 {
  @reactive()
  useUserInfo = true;

  @reactiveAutowired()
  userInfo: UserInfo;

  @memoized()
  text() {
    memoizedFn();
    if (this.useUserInfo) {
      return `input:${this.userInfo?.name}`;
    } else {
      return '不依赖reactiveAutowired';
    }
  }

  @bind()
  handleChangeUse() {
    this.useUserInfo = false;
  }

  @bind()
  handleClick() {
    const newName = this.userInfo.name + '1';
    this.userInfo = { name: newName };
  }

  render() {
    return (
      <div>
        <button onClick={this.handleChangeUse}>update userUserInfo</button>
        <button onClick={this.handleClick}>update name</button>
        <span role={'span'}>{this.text()}</span>;
      </div>
    );
  }
}

export default Form1;
export { memoizedFn };
