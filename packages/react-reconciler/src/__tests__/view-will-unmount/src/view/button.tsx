import { view, reactive, bind } from 'coco-mvc';
import { buttonWillUnmount } from '../../view-will-unmount.test';

@view()
class Button {
  @reactive()
  count = 1;

  viewWillUnmount() {
    buttonWillUnmount();
  }

  render() {
    return <button>count:{this.count}</button>;
  }
}

export default Button;
