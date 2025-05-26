import { _test_helper as cli_helper } from '@cocojs/cli';
import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';
import { _test_helper } from 'coco-mvc';
import {
  pkgPath,
  cocoIdxStr,
  cocoIdxAppJson,
} from '../../_helper_/pkg-path.ts';

export const mockFn = jest.fn();

let ApplicationContext;
let applicationJson;
let Render;
let Router;
let throwError;
let Button;
describe('refs', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      ApplicationContext = (await import(cocoIdxStr)).ApplicationContext;
      applicationJson = (await import(cocoIdxAppJson)).default;
      Render = (await import('coco-mvc')).Render;
      Router = (await import('coco-mvc')).Router;
      Button = (await import('./src/view/button.tsx')).default;
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

  test('支持函数形式绑定host组件或自定义组件', async () => {
    const { container } = _test_helper.mvc.render(
      ApplicationContext,
      Button,
      Render,
      Router,
      applicationJson
    );
    const button = getByRole(container, 'button');
    expect(button).toBeTruthy();
    expect(getByText(button, 'btn')).toBeTruthy();
    button.click();
    expect(mockFn).toHaveBeenCalledWith('id', 'view-component');
  });
});
