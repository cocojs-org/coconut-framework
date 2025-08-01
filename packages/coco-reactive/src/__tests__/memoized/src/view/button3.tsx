import { view, reactive, bind, memoized } from 'coco-mvc';

const memoizedFn1 = jest.fn();
const memoizedFn2 = jest.fn();

@view()
class Button3 {
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
    memoizedFn1();
    if (this.showName) {
      return `${this.name}:${this.score}`;
    } else {
      return `${this.score}`;
    }
  }

  @memoized()
  myLabel() {
    memoizedFn2();
    return `${this.myScore()}分`;
  }

  render() {
    return (
      <div>
        <button onClick={this.onClick}>click to hide name</button>
        <button onClick={this.onChangeName}>click to change name</button>
        <button onClick={this.onAddScore}>click to add score</button>
        {this.myLabel()}
        <div>{this.name}</div>
      </div>
    );
  }
}

export default Button3;
export { memoizedFn1, memoizedFn2 };
