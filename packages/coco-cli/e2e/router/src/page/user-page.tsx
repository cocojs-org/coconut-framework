import { page, route, autowired, Router, Route } from '@cocojs/mvc';

@route('/user/:id')
@page()
class UserPage {
    @autowired()
    route: Route;

    @autowired()
    router: Router;

    handleClick = () => {
        this.router.navigateTo('/user/wangwu');
    };

    render() {
        return (
            <div>
                <div>user page</div>
                <span id={'userId'}>{this.route.params.id}</span>
                <button id={'wangwu'} onClick={this.handleClick}>click</button>
            </div>
        );
    }
}

export default UserPage;
