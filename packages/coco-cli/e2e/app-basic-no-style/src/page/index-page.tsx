import { page, route } from '@cocojs/mvc';

@route('/')
@page()
class IndexPage {

    render() {
        return (
            <div>hello cocojs</div>
        );
    }
}

export default IndexPage;
