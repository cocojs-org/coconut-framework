import { page, route, autowired, Router } from '@cocojs/mvc';

@route('/a')
@page()
class APage {

    @autowired()
    router: Router;

    handleClick = () => {
        this.router.navigateTo('/b')
    }

    render() {
        return (
            <div>
                <span>a page</span>
                <button onClick={this.handleClick}>Click here</button>
            </div>
        );
    }
}

export default APage;
