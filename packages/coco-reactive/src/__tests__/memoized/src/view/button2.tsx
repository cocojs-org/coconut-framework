import { view, reactive, bind, memoized } from 'coco-mvc';

const memoizedFn = jest.fn();

@view()
class Button2 {
  @reactive()
  showName = true;

  @bind()
  onClick() {
    this.showName = false;
  }

  @reactive()
  name = '张三';

  @bind()
  onChangeName() {
    this.name += '1';
  }

  @reactive()
  score = 1;

  @bind()
  onAddScore() {
    this.score += 1;
  }

  @memoized()
  myScore() {
    memoizedFn();
    if (this.showName) {
      return `${this.name}:${this.score}分`;
    } else {
      return `${this.score}分`;
    }
  }

  render() {
    return (
      <div>
        <button onClick={this.onClick}>click to hide name</button>
        <button onClick={this.onChangeName}>click to change name</button>
        <button onClick={this.onAddScore}>click to add score</button>
        {this.myScore()}
        <div>{this.name}</div>
      </div>
    );
  }
}

export default Button2;
export { memoizedFn };
