import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let Application;
let throwError;
describe('不能同时添加多个component的复合装饰器的复合装饰器', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      Application = (await import(cocoIdxStr)).Application;
    } catch (e) {
      throwError = true;
    }
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    jest.resetModules();
    throwError = false;
  });

  test('不能同时添加多个component的复合装饰器的复合装饰器', async () => {
    expect(throwError).toBe(true);
  });
});
