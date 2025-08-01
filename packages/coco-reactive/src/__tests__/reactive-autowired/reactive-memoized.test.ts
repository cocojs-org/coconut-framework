import { _test_helper as cli_helper } from '@cocojs/cli';
import { pkgPath, cocoIdxStr, cocoIdxAppJson } from '../_helper_/pkg-path.ts';
import {
  getAllByRole,
  getByLabelText,
  getByRole,
  getByText,
  queryAllByRole,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';
import { _test_helper } from 'coco-mvc';

let Application;
let applicationJson;
let Render;
let Router;
let throwError;
let Page;
let Form;
let Detail;
let UserInfo;
let Page1;
let memoizedFn1;
let Page2;
let memoizedFn21;
let memoizedFn22;

describe('store', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      Application = (await import(cocoIdxStr)).Application;
      applicationJson = (await import(cocoIdxAppJson)).default;
      Render = (await import('coco-mvc')).Render;
      Router = (await import('coco-mvc')).Router;
      Page = (await import('./src/view/page.tsx')).default;
      Form = (await import('./src/view/form.tsx')).default;
      Detail = (await import('./src/view/detail.tsx')).default;
      Page1 = (await import('./src/view/page1.tsx')).default;
      memoizedFn1 = (await import('./src/view/form1.tsx')).memoizedFn;
      Page2 = (await import('./src/view/page2.tsx')).default;
      memoizedFn21 = (await import('./src/view/form2.tsx')).memoizedFn;
      memoizedFn22 = (await import('./src/view/form2.tsx')).memoizedFn1;
      UserInfo = (await import('./src/store/user-info.ts')).default;
    } catch (e) {
      console.info(e);
      throwError = true;
    }
  });

  afterEach(async () => {
    _test_helper.mvc.cleanRender();
    _test_helper.iocContainer.clear();
    jest.resetModules();
    throwError = false;
  });

  test('不同的组件注入不同的实例', async () => {
    const { application } = _test_helper.mvc.render(
      Application,
      Page,
      Render,
      Router,
      applicationJson
    );
    const form = application.getComponent(Form);
    const detail = application.getComponent(Detail);
    // todo userInfo是否需要是UserInfo的实例
    expect(form.userInfo).toBeInstanceOf(UserInfo);
    expect(detail.userInfo).toBeInstanceOf(UserInfo);
    expect(form.userInfo === detail.userInfo).toBe(false);
  });

  test('一个组件修改了store的reactive属性，其他组件也会同步更新', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      Page,
      Render,
      Router,
      applicationJson
    );
    const input = getByRole(container, 'button');
    expect(getByText(input, 'input:张三')).toBeTruthy();
    const heading = getByRole(container, 'heading');
    expect(getByText(heading, '展示:张三')).toBeTruthy();
    input.click();
    await waitFor(() => {
      expect(getByText(input, 'input:李四')).toBeTruthy();
      expect(getByText(heading, '展示:李四')).toBeTruthy();
    });
  });

  test('单个组件内，memoized可以依赖reactiveAutowired，也可以取消依赖', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      Page1,
      Render,
      Router,
      applicationJson
    );
    const buttons = getAllByRole(container, 'button');
    const input = getByRole(container, 'span');
    expect(getByText(input, 'input:张三')).toBeTruthy();
    const heading = getByRole(container, 'heading');
    expect(getByText(heading, '展示:张三')).toBeTruthy();
    expect(memoizedFn1).toHaveBeenCalledTimes(1);
    buttons[1].click();
    await waitFor(async () => {
      expect(getByText(input, 'input:张三1')).toBeTruthy();
      expect(getByText(heading, '展示:张三1')).toBeTruthy();
      expect(memoizedFn1).toHaveBeenCalledTimes(2);
      buttons[0].click();
      await waitFor(async () => {
        expect(getByText(input, '不依赖reactiveAutowired')).toBeTruthy();
        expect(getByText(heading, '展示:张三1')).toBeTruthy();
        expect(memoizedFn1).toHaveBeenCalledTimes(3);
        buttons[1].click();
        await waitFor(async () => {
          expect(getByText(input, '不依赖reactiveAutowired')).toBeTruthy();
          expect(getByText(heading, '展示:张三11')).toBeTruthy();
          expect(memoizedFn1).toHaveBeenCalledTimes(3);
        });
      });
    });
  });

  test('单个组件内部，memoized a 依赖memoized b, memoized b取消依赖reactiveAutowired，再修改reactiveAutowired，memoized a也不会重新计算', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      Page2,
      Render,
      Router,
      applicationJson
    );
    const buttons = getAllByRole(container, 'button');
    const input = getByRole(container, 'span');
    expect(getByText(input, '张三:1分')).toBeTruthy();
    const heading = getByRole(container, 'heading');
    expect(getByText(heading, '展示:张三')).toBeTruthy();
    expect(memoizedFn21).toHaveBeenCalledTimes(1);
    expect(memoizedFn22).toHaveBeenCalledTimes(1);
    buttons[1].click();
    await waitFor(async () => {
      expect(getByText(input, '张三四:1分')).toBeTruthy();
      expect(getByText(heading, '展示:张三四')).toBeTruthy();
      expect(memoizedFn21).toHaveBeenCalledTimes(2);
      expect(memoizedFn22).toHaveBeenCalledTimes(2);
      buttons[2].click();
      await waitFor(async () => {
        expect(getByText(input, '张三四:2分')).toBeTruthy();
        expect(getByText(heading, '展示:张三四')).toBeTruthy();
        expect(memoizedFn21).toHaveBeenCalledTimes(3);
        expect(memoizedFn22).toHaveBeenCalledTimes(3);
        buttons[0].click();
        await waitFor(async () => {
          expect(getByText(input, '匿名:2分')).toBeTruthy();
          expect(getByText(heading, '展示:张三四')).toBeTruthy();
          expect(memoizedFn21).toHaveBeenCalledTimes(4);
          expect(memoizedFn22).toHaveBeenCalledTimes(4);
          buttons[2].click();
          await waitFor(async () => {
            expect(getByText(input, '匿名:3分')).toBeTruthy();
            expect(getByText(heading, '展示:张三四')).toBeTruthy();
            expect(memoizedFn21).toHaveBeenCalledTimes(5);
            expect(memoizedFn22).toHaveBeenCalledTimes(5);
            buttons[1].click();
            await waitFor(async () => {
              expect(getByText(input, '匿名:3分')).toBeTruthy();
              expect(getByText(heading, '展示:张三四四')).toBeTruthy();
              expect(memoizedFn21).toHaveBeenCalledTimes(5);
              expect(memoizedFn22).toHaveBeenCalledTimes(5);
            });
          });
        });
      });
    });
  });
});
