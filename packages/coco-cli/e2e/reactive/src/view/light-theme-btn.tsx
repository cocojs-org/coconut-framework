import { view, reactive, autowired } from '@cocojs/mvc';
import Theme from '../store/theme';

@view()
class LightThemeBtn {

    @autowired()
    theme: Theme;

    onClick = () => {
        this.theme.value = 'light'
    }


    render() {
        return <button id={'light'} onClick={this.onClick}>btn</button>
    }
}

export default LightThemeBtn;
