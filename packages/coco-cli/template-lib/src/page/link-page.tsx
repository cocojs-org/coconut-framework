import { page, route } from 'coco-mvc';
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
