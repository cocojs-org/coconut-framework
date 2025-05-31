import { view, reactive } from 'coco-mvc';

@view()
class Link {
  @reactive()
  name: string;

  render() {
    return <div className={'bg-amber-950 text-white'}>link</div>;
  }
}

export default Link;
