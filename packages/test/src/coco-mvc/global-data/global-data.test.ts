import { _test_helper as cli_helper } from '@cocojs/cli';
import { _test_helper } from 'coco-mvc';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let ApplicationContext;
let Button;
let Button1;
describe('global-data', () => {
  beforeEach(async () => {
    cli_helper.buildDotCoco(pkgPath(__dirname));
    ApplicationContext = (await import(cocoIdxStr)).ApplicationContext;
    Button = (await import('./src/view/button.tsx')).default;
    Button1 = (await import('./src/view/button1.tsx')).default;
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    jest.resetModules();
  });

  test('可以获取到globalData，并且是同一引用', async () => {
    const context = new ApplicationContext();
    const btn = context.getComponent(Button);
    const btn1 = context.getComponent(Button1);
    expect(btn).not.toBe(btn1);
    expect(btn.login).toBe(btn1.login);
    expect(btn.login.token).toBe('mock token');
  });
});
