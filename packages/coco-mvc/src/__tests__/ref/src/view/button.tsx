import { view, ref, bind } from 'coco-mvc';
import View from './view.tsx';
import { mockFn } from '../../ref.test';

@view()
class Button {
  @bind()
  handleClick() {
    if (this.input.current && this.view.current) {
      mockFn(this.input.current.id, this.view.current.id());
    }
  }

  @ref()
  input: { current: HTMLElement };

  @ref()
  view: { current: View };

  render() {
    return (
      <div>
        <button id={'id'} ref={this.input} onClick={this.handleClick}>
          btn
        </button>
        <View ref={this.view} />
      </div>
    );
  }
}

export default Button;
