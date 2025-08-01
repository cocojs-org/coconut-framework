import { _test_helper as cli_helper } from '@cocojs/cli';
import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr, cocoIdxAppJson } from '../_helper_/pkg-path';

let Application;
let applicationJson;
let Render;
let Router;
let throwError;
let App;
describe('decorator', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      Application = (await import(cocoIdxStr)).Application;
      applicationJson = (await import(cocoIdxAppJson)).default;
      Render = (await import('coco-mvc')).Render;
      Router = (await import('coco-mvc')).Router;
      App = (await import('./src/view/app.tsx')).default;
    } catch (e) {
      throwError = true;
    }
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    _test_helper.mvc.cleanRender();
    jest.resetModules();
    throwError = false;
  });

  test('正常渲染父子组件', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      App,
      Render,
      Router,
      applicationJson
    );
    const header = getByRole(container, 'heading');
    const button = getByRole(header, 'button');
    expect(button).toBeTruthy();
    expect(getByText(button, 'count:1')).toBeTruthy();
    button.click();
    await waitFor(() => {
      expect(getByText(button, 'count:2')).toBeTruthy();
    });
  });
});
