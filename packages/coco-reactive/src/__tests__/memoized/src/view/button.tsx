import { view, reactive, bind, memoized } from 'coco-mvc';

const memoizedFn = jest.fn();

@view()
class Button {
  @reactive()
  count = 1;

  @memoized()
  score() {
    memoizedFn();
    return `${this.count}`;
  }

  @bind()
  onClick() {
    this.count = 2;
  }

  @reactive()
  name = '张三';

  @bind()
  onClickName() {
    this.name = '李四';
  }

  render() {
    return (
      <div>
        <button onClick={this.onClick}>click to update count</button>
        <button onClick={this.onClickName}>click to update name</button>
        {this.name}:{this.score()}
      </div>
    );
  }
}

export default Button;
export { memoizedFn };
