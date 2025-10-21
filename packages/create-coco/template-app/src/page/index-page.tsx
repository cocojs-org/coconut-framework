import { view, route } from 'coco-mvc';

@route('/')
@view()
class IndexPage {
    render() {
        return <div>hello coco-mvc</div>;
    }
}

export default IndexPage;
