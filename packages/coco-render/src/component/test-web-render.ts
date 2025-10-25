// @ts-ignore todo fix it
import { render as renderApp, registerMvcApi } from 'react-dom';
import { type Application } from 'coco-ioc-container';
import render from '../decorator/render';
import { jsx } from 'react';
import Render from './render';

@render()
class TestWebRender extends Render {
    container: HTMLElement;

    init(application: Application) {
        registerMvcApi(application);
        this.container = document.createElement('div');
    }

    public render(component: any) {
        return renderApp(jsx(component, undefined), this.container);
    }

    // todo unregisterMvcApi
}

export default TestWebRender;
