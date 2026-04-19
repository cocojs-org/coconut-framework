import { page, route, reactive, bind } from '@cocojs/mvc';

@route('/bind')
@page()
class BindPage {

    @reactive()
    counter: number = 0;

    noBindFn () {
        console.log(this === undefined ? 'this is undefined in unbind function.' : '可能是通过this.noBindFn调用的，有问题')
    }

    @bind()
    handleClick () {
        const noBindFn = this.noBindFn;
        noBindFn();
        this.counter += 1;
    }

    render() {
        return (
            <div>
                <span id={'txt'}>counter: {this.counter}</span>
                <button id={'add'} onClick={this.handleClick}>
                    click!
                </button>
            </div>
        );
    }
}

export default BindPage;
