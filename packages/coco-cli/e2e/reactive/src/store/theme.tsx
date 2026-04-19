import { store, reactive, bind } from '@cocojs/mvc';

@store()
class Theme {

    @reactive()
    value: 'light' | 'dark' = 'light';
}

export default Theme;
