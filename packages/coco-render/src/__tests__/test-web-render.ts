// @ts-ignore todo fix it
import { render as renderApp, registerApplication } from 'coconut-web';
import { type Application, init } from 'coco-ioc-container';
import render from '../decorator/render.ts';
import { jsx } from 'coco-react';
import Render from '../component/render.ts';

@render()
class TestWebRender extends Render {
  container: HTMLElement;

  @init()
  init(application: Application) {
    registerApplication(application);
    this.container = document.createElement('div');
  }

  public render(component: any) {
    return renderApp(jsx(component, undefined), this.container);
  }

  // todo unregisterApplication
}

export default TestWebRender;
