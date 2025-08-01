import { view, reactive, bind } from 'coco-mvc';

@view()
class Button {
  @reactive()
  count = 1;

  @bind()
  onClick() {
    this.count = 2;
  }

  render() {
    return <button onClick={this.onClick}>count:{this.count}</button>;
  }
}

export default Button;
