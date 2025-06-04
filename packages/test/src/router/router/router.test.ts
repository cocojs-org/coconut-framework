import { _test_helper } from 'coco-mvc';
import { _test_helper as cli_helper } from '@cocojs/cli';
import { getByText, waitFor } from '@testing-library/dom';
import {
  pkgPath,
  cocoIdxStr,
  cocoIdxAppJson,
} from '../../_helper_/pkg-path.ts';

let Application;
let applicationJson;
let Render;
let Router;
let throwError;
describe('router', () => {
  beforeEach(async () => {
    cli_helper.buildDotCoco(pkgPath(__dirname));
    Application = (await import(cocoIdxStr)).Application;
    applicationJson = (await import(cocoIdxAppJson)).default;
    Render = (await import('coco-mvc')).Render;
    Router = (await import('coco-mvc')).Router;
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    _test_helper.mvc.cleanRender();
    jest.resetModules();
    throwError = false;
  });

  test('路由切换，页面也会重新渲染', async () => {
    const { container, ctx } = _test_helper.mvc.start(
      Application,
      Render,
      Router,
      applicationJson
    );
    const router = ctx.getComponent(Router);
    router.navigateTo('/');
    await waitFor(async () => {
      expect(getByText(container, 'index page')).toBeTruthy();
      router.navigateTo('/todo-page');
      await waitFor(() => {
        expect(getByText(container, 'todo page')).toBeTruthy();
      });
    });
  });
});
