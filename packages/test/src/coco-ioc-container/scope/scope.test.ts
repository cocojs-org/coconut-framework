import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let ApplicationContext;
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
      ApplicationContext = (await import(cocoIdxStr)).ApplicationContext;
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
    const context = new ApplicationContext();
    const s1 = context.getComponent(DefaultValue);
    const s2 = context.getComponent(DefaultValue);
    expect(s1 === s2).toBe(true);
  });

  test('支持显式singleton', async () => {
    const context = new ApplicationContext();
    const s1 = context.getComponent(Single);
    const s2 = context.getComponent(Single);
    expect(s1 === s2).toBe(true);
  });

  test('支持设置prototype', async () => {
    const context = new ApplicationContext();
    const p1 = context.getComponent(Prototype);
    const p2 = context.getComponent(Prototype);
    expect(p1 === p2).toBe(false);
  });
});
