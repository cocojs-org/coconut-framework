import { _test_helper } from 'coco-mvc';
import { _test_helper as cli_helper } from '@cocojs/cli';
import { pkgPath, cocoIdxStr, cocoIdxAppJson } from '../_helper_/pkg-path.ts';
import { getByText, queryAllByRole, waitFor } from '@testing-library/dom';

let Application;
let applicationJson;
let Render;
let Router;
let throwError;
let Button;
let memoizedFn;
let Button1;
let Button2;
let memoizedFn2;
let Button3;
let memoizedFn31;
let memoizedFn32;
describe('memoized', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      Application = (await import(cocoIdxStr)).Application;
      applicationJson = (await import(cocoIdxAppJson)).default;
      Render = (await import('coco-mvc')).Render;
      Router = (await import('coco-mvc')).Router;
      Button = (await import('./src/view/button.tsx')).default;
      memoizedFn = (await import('./src/view/button.tsx')).memoizedFn;
      Button1 = (await import('./src/view/button1.tsx')).default;
      Button2 = (await import('./src/view/button2.tsx')).default;
      memoizedFn2 = (await import('./src/view/button2.tsx')).memoizedFn;
      Button3 = (await import('./src/view/button3.tsx')).default;
      memoizedFn31 = (await import('./src/view/button3.tsx')).memoizedFn1;
      memoizedFn32 = (await import('./src/view/button3.tsx')).memoizedFn2;
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

  test('memoized直接依赖reactive，且可以缓存上次的值', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      Button,
      Render,
      Router,
      applicationJson
    );
    const buttons = queryAllByRole(container, 'button');
    expect(buttons.length).toBe(2);
    expect(buttons[0]).toBeTruthy();
    expect(buttons[1]).toBeTruthy();
    expect(getByText(container, '张三:1')).toBeTruthy();
    buttons[0].click();
    await waitFor(async () => {
      expect(getByText(container, '张三:2')).toBeTruthy();
      buttons[1].click();
      await waitFor(() => {
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
      });
    });
  });

  test('memoized a依赖reactive a，memoized b依赖memoized a，当reactive a更新时，memoized b也能更新', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      Button1,
      Render,
      Router,
      applicationJson
    );
    const buttons = queryAllByRole(container, 'button');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toBeTruthy();
    expect(getByText(container, '张三：1分')).toBeTruthy();
    buttons[0].click();
    await waitFor(async () => {
      expect(getByText(container, '张三：2分')).toBeTruthy();
    });
  });

  test('memoized取消依赖reactive时，再修改reactive，memoized不会重新计算', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      Button2,
      Render,
      Router,
      applicationJson
    );
    const buttons = queryAllByRole(container, 'button');
    expect(getByText(container, '张三:1分')).toBeTruthy();
    expect(memoizedFn2).toHaveBeenCalledTimes(1);
    buttons[1].click();
    await waitFor(async () => {
      expect(getByText(container, '张三1:1分')).toBeTruthy();
      expect(memoizedFn2).toHaveBeenCalledTimes(2);
      buttons[2].click();
      await waitFor(async () => {
        expect(getByText(container, '张三1:2分')).toBeTruthy();
        expect(memoizedFn2).toHaveBeenCalledTimes(3);
        buttons[0].click();
        await waitFor(async () => {
          expect(getByText(container, '2分')).toBeTruthy();
          expect(memoizedFn2).toHaveBeenCalledTimes(4);
          buttons[2].click();
          await waitFor(async () => {
            expect(getByText(container, '3分')).toBeTruthy();
            expect(memoizedFn2).toHaveBeenCalledTimes(5);
            buttons[1].click();
            await waitFor(async () => {
              expect(getByText(container, '3分')).toBeTruthy();
              expect(memoizedFn2).toHaveBeenCalledTimes(5);
            });
          });
        });
      });
    });
  });

  test('memoized a 依赖memoized b, memoized b取消依赖reactive，再修改reactive，memoized a也不会重新计算', async () => {
    const { container } = _test_helper.mvc.render(
      Application,
      Button3,
      Render,
      Router,
      applicationJson
    );
    const buttons = queryAllByRole(container, 'button');
    expect(getByText(container, '张三:1分')).toBeTruthy();
    expect(memoizedFn31).toHaveBeenCalledTimes(1);
    expect(memoizedFn32).toHaveBeenCalledTimes(1);
    buttons[1].click();
    await waitFor(async () => {
      expect(getByText(container, '张三1:1分')).toBeTruthy();
      expect(memoizedFn31).toHaveBeenCalledTimes(2);
      expect(memoizedFn32).toHaveBeenCalledTimes(2);
      buttons[2].click();
      await waitFor(async () => {
        expect(getByText(container, '张三1:2分')).toBeTruthy();
        expect(memoizedFn31).toHaveBeenCalledTimes(3);
        expect(memoizedFn32).toHaveBeenCalledTimes(3);
        buttons[0].click();
        await waitFor(async () => {
          expect(getByText(container, '2分')).toBeTruthy();
          expect(memoizedFn31).toHaveBeenCalledTimes(4);
          expect(memoizedFn32).toHaveBeenCalledTimes(4);
          buttons[2].click();
          await waitFor(async () => {
            expect(getByText(container, '3分')).toBeTruthy();
            expect(memoizedFn31).toHaveBeenCalledTimes(5);
            expect(memoizedFn32).toHaveBeenCalledTimes(5);
            buttons[1].click();
            await waitFor(async () => {
              expect(getByText(container, '3分')).toBeTruthy();
              expect(memoizedFn31).toHaveBeenCalledTimes(5);
              expect(memoizedFn32).toHaveBeenCalledTimes(5);
            });
          });
        });
      });
    });
  });
});
