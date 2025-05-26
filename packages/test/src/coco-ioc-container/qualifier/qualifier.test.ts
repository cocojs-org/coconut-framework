import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let ApplicationContext;
let buildError;
let WrongQualifierId;
let Child;
let UserInfo;
let User;
describe('qualifier', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      Child = (await import('./src/component/child.ts')).default;
      UserInfo = (await import('./src/view/user-info.tsx')).default;
      User = (await import('./src/view/user.tsx')).default;
      WrongQualifierId = (await import('./src/view/wrong-qualifier-id.tsx'))
        .default;
      ApplicationContext = (await import(cocoIdxStr)).ApplicationContext;
    } catch (e) {
      console.error(e);
      buildError = true;
    }
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    jest.resetModules();
    buildError = false;
  });

  test('@autowired注入的组件存在至少2个子组件，但是没有使用@qualifier，则抛出异常', async () => {
    let error = false;
    try {
      const context = new ApplicationContext();
      context.getComponent(UserInfo);
    } catch (e) {
      error = true;
    }
    expect(error).toBe(true);
  });

  test('@autowired注入的组件存在多个子组件，使用@qualifier指定不存在的id，抛出异常', async () => {
    let error = false;
    try {
      const context = new ApplicationContext();
      context.getComponent(WrongQualifierId);
    } catch (e) {
      error = true;
    }
    expect(error).toBe(true);
  });

  test('@autowired注入的组件存在多个子组件，使用@qualifier指定一个子组件', async () => {
    const context = new ApplicationContext();
    const user = context.getComponent(User);
    expect(user.parent instanceof Child).toBe(true);
  });
});
