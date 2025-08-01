import { view } from 'coco-mvc';
import Detail from './detail.tsx';
import Form from './form.tsx';

@view()
class Page {
  render() {
    return (
      <div>
        <Detail />
        <Form />
      </div>
    );
  }
}

export default Page;
