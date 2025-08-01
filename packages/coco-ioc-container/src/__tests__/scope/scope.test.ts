import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../_helper_/pkg-path';

let Application;
let throwError;
let DefaultValue;
let Single;
let Prototype;
describe('decorator', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      DefaultValue = (await import('./src/component/default-value.ts')).default;
      Single = (await import('./src/component/single.ts')).default;
      Prototype = (await import('./src/component/prototype.ts')).default;
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

  test('默认singleton模式', async () => {
    const application = new Application();
    application.start();
    const s1 = application.getComponent(DefaultValue);
    const s2 = application.getComponent(DefaultValue);
    expect(s1 === s2).toBe(true);
  });

  test('支持显式singleton', async () => {
    const application = new Application();
    application.start();
    const s1 = application.getComponent(Single);
    const s2 = application.getComponent(Single);
    expect(s1 === s2).toBe(true);
  });

  test('支持设置prototype', async () => {
    const application = new Application();
    application.start();
    const p1 = application.getComponent(Prototype);
    const p2 = application.getComponent(Prototype);
    expect(p1 === p2).toBe(false);
  });
});
