import { view } from 'coco-mvc';
import Button from './button';

@view()
class App {
  render() {
    return (
      <h1>
        <Button />
        <Button />
      </h1>
    );
  }
}

export default App;
