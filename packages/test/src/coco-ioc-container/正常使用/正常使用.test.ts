import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let ApplicationContext;
let Button;
let Single;
describe('ioc-container', () => {
  beforeEach(async () => {
    cli_helper.buildDotCoco(pkgPath(__dirname));
    Single = (await import('./src/component/a-single.ts')).default;
    Button = (await import('./src/component/a-button.ts')).default;
    ApplicationContext = (await import(cocoIdxStr)).ApplicationContext;
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    jest.resetModules();
  });

  test('通过cls可以拿到实例', async () => {
    const context = new ApplicationContext();
    const component = context.getComponent(Button);
    expect(component).toBeInstanceOf(Button);
  });

  test('component装饰器设置prototype每次返回不同的实例', async () => {
    const context = new ApplicationContext();
    const component1 = context.getComponent(Button);
    const component2 = context.getComponent(Button);
    expect(component1).toBeInstanceOf(Button);
    expect(component2).toBeInstanceOf(Button);
    expect(component1).not.toBe(component2);
  });

  test('单例模式每次获取到的都是一样的', async () => {
    const context = new ApplicationContext();
    const component1 = context.getComponent(Single);
    const component2 = context.getComponent(Single);
    expect(component1).toBeInstanceOf(Single);
    expect(component2).toBeInstanceOf(Single);
    expect(component1).toBe(component2);
  });
});
