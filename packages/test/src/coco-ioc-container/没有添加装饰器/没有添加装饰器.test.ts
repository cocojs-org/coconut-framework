import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let Application;
let Space;
describe('ioc-container', () => {
  beforeEach(async () => {
    cli_helper.buildDotCoco(pkgPath(__dirname));
    Space = (await import('./src/component/Space.ts')).default;
    Application = (await import(cocoIdxStr)).Application;
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    jest.resetModules();
  });

  test('没有添加注解，则不能获取组件实例', async () => {
    let throwError = false;
    try {
      const application = new Application();
      application.start();
      application.getComponent(Space);
    } catch (e) {
      throwError = true;
    }
    expect(throwError).toBe(true);
  });
});
