import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let Application;
let throwError;
let User;
let Button;
let Theme;
describe('decorator', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      User = (await import('./src/component/user.ts')).default;
      Button = (await import('./src/component/button.ts')).default;
      Theme = (await import('./src/component/theme.ts')).default;
      Application = (await import(cocoIdxStr)).Application;
    } catch (e) {
      console.error(e);
      throwError = true;
    }
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    jest.resetModules();
    throwError = false;
  });

  test('直接传入要注册的ioc组件', async () => {
    const application = new Application();
    application.start();
    const user = application.getComponent(User);
    expect(user).toBeTruthy();
  });

  test('通过对象传入要注册的ioc组件，默认singleton模式', async () => {
    const application = new Application();
    application.start();
    const t1 = application.getComponent(Theme);
    const t2 = application.getComponent(Theme);
    expect(t1 === t2).toBe(true);
  });

  test('通过对象传入要注册的ioc组件，可以设置prototype模式', async () => {
    const application = new Application();
    application.start();
    const b1 = application.getComponent(Button);
    const b2 = application.getComponent(Button);
    expect(b1 === b2).toBe(false);
  });
});
