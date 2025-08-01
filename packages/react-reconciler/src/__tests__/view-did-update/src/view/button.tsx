import { view, reactive, bind } from 'coco-mvc';
import { buttonDidUpdate } from '../../view-did-update.test';

@view()
class Button {
  @reactive()
  count = 1;

  @bind()
  onClick() {
    this.count = 2;
  }

  viewDidUpdate(prevProps, { count: prevCount }) {
    buttonDidUpdate(prevCount);
  }

  render() {
    return <button onClick={this.onClick}>count:{this.count}</button>;
  }
}

export default Button;
