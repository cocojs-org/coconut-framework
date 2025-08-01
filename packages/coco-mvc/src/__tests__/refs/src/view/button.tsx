import { view, refs, bind } from 'coco-mvc';
import View from './view.tsx';
import { mockFn } from '../../refs.test';

const btnKey = 1;
const viewKey = 2;

@view()
class Button {
  @bind()
  handleClick() {
    if (this.refs[btnKey] && this.refs[viewKey]) {
      mockFn(this.refs[btnKey].id, (this.refs[viewKey] as View).id());
    }
  }

  @refs()
  refs: Record<number, HTMLElement | View>;

  render() {
    return (
      <div>
        <button
          id={'id'}
          ref={(elm) => (this.refs[btnKey] = elm)}
          onClick={this.handleClick}
        >
          btn
        </button>
        <View ref={(instance) => (this.refs[viewKey] = instance)} />
      </div>
    );
  }
}

export default Button;
