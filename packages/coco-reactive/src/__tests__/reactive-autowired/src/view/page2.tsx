import { view } from 'coco-mvc';
import Form2 from './form2.tsx';
import Detail2 from './detail2.tsx';

@view()
class Page2 {
  render() {
    return (
      <div>
        <Form2 />
        <Detail2 />
      </div>
    );
  }
}

export default Page2;
