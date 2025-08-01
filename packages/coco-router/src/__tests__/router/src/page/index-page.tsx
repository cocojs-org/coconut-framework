import { page, route } from 'coco-mvc';

@route('/')
@page()
class IndexPage {
  render() {
    return <div>index page</div>;
  }
}

export default IndexPage;
