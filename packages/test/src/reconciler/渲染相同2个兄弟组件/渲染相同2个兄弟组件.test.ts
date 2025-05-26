import { _test_helper as cli_helper } from '@cocojs/cli';
import {
  getByLabelText,
  getByRole,
  getByText,
  queryAllByRole,
  waitFor,
} from '@testing-library/dom';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr, cocoIdxAppJson } from '../../_helper_/pkg-path';

let ApplicationContext;
let applicationJson;
let Render;
let Router;
let throwError;
let App;
describe('decorator', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      ApplicationContext = (await import(cocoIdxStr)).ApplicationContext;
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
      ApplicationContext,
      App,
      Render,
      Router,
      applicationJson
    );
    const header = getByRole(container, 'heading');
    const buttons = queryAllByRole(header, 'button');
    expect(buttons).toHaveLength(2);
    expect(buttons[0].textContent).toBe('count:1');
    expect(buttons[1].textContent).toBe('count:1');
    buttons[0].click();
    await waitFor(async () => {
      expect(buttons[0].textContent).toBe('count:2');
      buttons[1].click();
      await waitFor(() => {
        expect(buttons[1].textContent).toBe('count:2');
      });
    });
  });
});
