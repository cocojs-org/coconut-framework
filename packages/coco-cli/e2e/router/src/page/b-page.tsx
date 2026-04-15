import { page, route, autowired, Router } from '@cocojs/mvc';

@route('/b')
@page()
class BPage {

    @autowired()
    router: Router;

    handleClick = () => {
        this.router.navigateTo('/a')

    }

    render() {
        return (
            <div>
                <span>b page</span>
                <button onClick={this.handleClick}>Click here</button>
            </div>
        );
    }
}

export default BPage;
