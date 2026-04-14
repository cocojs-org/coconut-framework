import { view, reactive, autowired } from '@cocojs/mvc';
import Theme from '../store/theme';

@view()
class DarkThemeBtn {

    @autowired()
    theme: Theme;

    onClick = () => {
        this.theme.value = 'dark'
    }


    render() {
        return <button id={'dark'} onClick={this.onClick}>btn</button>
    }
}

export default DarkThemeBtn;
