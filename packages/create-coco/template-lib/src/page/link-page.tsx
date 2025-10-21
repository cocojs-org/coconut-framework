import { page, route } from 'coco-mvc';
// TODO: 不要使用源码测试，而是使用构建后的产物测试
import Link from '../view/link';

@route('/link')
@page()
class LinkPage {
    render() {
        return (
            <div>
                <Link />
            </div>
        );
    }
}

export default LinkPage;
