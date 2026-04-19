import { page, route, autowired } from '@cocojs/mvc';
import Theme from '../store/theme';
import DarkThemeBtn from '@/view/dark-theme-btn';
import LightThemeBtn from '@/view/light-theme-btn';

@route('/store')
@page()
class StorePage {

    @autowired()
    theme: Theme;

    render() {
        return (
            <div>
                <span id={'txt'}>theme: {this.theme.value}</span>
                <DarkThemeBtn />
                <LightThemeBtn />
            </div>
        );
    }
}

export default StorePage;
