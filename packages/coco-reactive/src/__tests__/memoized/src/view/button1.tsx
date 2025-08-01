import { view, reactive, bind, memoized } from 'coco-mvc';

const memoizedFn = jest.fn();

@view()
class Button1 {
  @reactive()
  count = 1;

  @memoized()
  score() {
    memoizedFn();
    return `${this.count}分`;
  }

  @memoized()
  myScore() {
    return `张三：${this.score()}`;
  }

  @bind()
  onClick() {
    this.count = 2;
  }

  render() {
    return (
      <div>
        <button onClick={this.onClick}>click to update count</button>
        {this.myScore()}
      </div>
    );
  }
}

export default Button1;
export { memoizedFn };
