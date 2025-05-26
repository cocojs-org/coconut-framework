import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr, cocoIdxAppJson } from '../../_helper_/pkg-path';

let ApplicationContext;
let throwError;
let User;
let Computer;
let Button;
let Theme;
let UserInfo;
describe('autowired', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      User = (await import('./src/component/user.ts')).default;
      Computer = (await import('./src/component/computer.ts')).default;
      Theme = (await import('./src/component/theme.ts')).default;
      UserInfo = (await import('./src/view/user-info.tsx')).default;
      Button = (await import('./src/view/button.tsx')).default;
      ApplicationContext = (await import(cocoIdxStr)).ApplicationContext;
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

  test('可以拿到注册的view组件，且拿到的实例也是不同的', async () => {
    const context = new ApplicationContext();
    const userInfo1 = context.getComponent(UserInfo);
    const userInfo2 = context.getComponent(UserInfo);
    expect(userInfo1.button instanceof Button).toBe(true);
    expect(userInfo2.button instanceof Button).toBe(true);
    expect(userInfo1.button).not.toBe(userInfo2.button);
  });

  test('可以拿到注册的view组件，且可以拿到单例组件', async () => {
    const context = new ApplicationContext();
    const userInfo1 = context.getComponent(UserInfo);
    const userInfo2 = context.getComponent(UserInfo);
    expect(userInfo1.theme instanceof Theme).toBe(true);
    expect(userInfo1.theme).toBe(userInfo2.theme);
  });

  test('可以拿到@component注册的组件，默认是单例组件', async () => {
    const context = new ApplicationContext();
    const userInfo1 = context.getComponent(UserInfo);
    const userInfo2 = context.getComponent(UserInfo);
    expect(userInfo1.user instanceof User).toBe(true);
    expect(userInfo1.user).toBe(userInfo2.user);
  });

  test('可以拿到@component注册的组件，也支持每次返回新的实例', async () => {
    const context = new ApplicationContext();
    const userInfo1 = context.getComponent(UserInfo);
    const userInfo2 = context.getComponent(UserInfo);
    expect(userInfo1.computer instanceof Computer).toBe(true);
    expect(userInfo2.computer instanceof Computer).toBe(true);
    expect(userInfo1.computer).not.toBe(userInfo2.computer);
  });
});
