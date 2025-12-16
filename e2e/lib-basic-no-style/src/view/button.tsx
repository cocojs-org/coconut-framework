import {view} from '@cocojs/mvc';

interface IButtonProps {
  children: string;
  onClick?: () => void;
  type: 'primary' | 'link' | 'primary-link';
  loading?: boolean;
}

@view()
class Button {
  props: IButtonProps


  onClick = () => {
    if (!this.props.loading) {
      this.props.onClick?.();
    }
  }

  render() {
    return <div onClick={this.onClick}>
      {this.props.children}{this.props.loading ? `...` : null}
    </div>
  }
}

export default Button;