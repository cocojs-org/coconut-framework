import { page, route, reactive } from '@cocojs/mvc';

@route('/reactive')
@page()
class ReactivePage {

    @reactive()
    counter: number = 0;

    handleClick = () => {
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

export default ReactivePage;
