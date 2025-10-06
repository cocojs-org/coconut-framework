// @ts-ignore todo fix it
import { render as renderApp, registerMvcApi } from 'react-dom';
import { type Application, getMetaClassById } from 'coco-ioc-container';
import render from '../decorator/render';
import { jsx } from 'react';
import Render from '../component/render';

/**
 * @public
 */
@render()
class WebRender extends Render {
  container: HTMLElement;

  init(application: Application) {
    registerMvcApi(application, getMetaClassById);
    this.container = document.getElementById('root');
    if (!this.container) {
      console.error('未找到根节点');
    }
  }

  public render(component: any) {
    return renderApp(jsx(component, undefined), this.container);
  }

  // todo unregisterMvcApi
}

export default WebRender;
