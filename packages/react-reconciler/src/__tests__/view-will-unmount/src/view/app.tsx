import { view, reactive, bind } from 'coco-mvc';
import Button from './button';

@view()
class App {
  @reactive()
  show: boolean = true;

  @bind()
  handleClick() {
    this.show = false;
  }

  render() {
    return (
      <h1 onClick={this.handleClick}>{this.show ? <Button /> : 'not show'}</h1>
    );
  }
}

export default App;
