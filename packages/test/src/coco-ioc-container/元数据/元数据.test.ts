import { _test_helper, Component, Target } from 'coco-mvc';
import { _test_helper as cli_helper } from '@cocojs/cli';
import { pkgPath, cocoIdxStr } from '../../_helper_/pkg-path';

let Application;
let Button;
let throwError;
describe('decorator', () => {
  beforeEach(async () => {
    try {
      cli_helper.buildDotCoco(pkgPath(__dirname));
      Application = (await import(cocoIdxStr)).Application;
      Button = (await import('./src/component/a-button.ts')).default;
    } catch (e) {
      throwError = true;
    }
  });

  afterEach(async () => {
    _test_helper.iocContainer.clear();
    jest.resetModules();
  });

  test('组件类的元数据正确', async () => {
    const application = new Application();
    application.start();
    const asExpected = _test_helper.iocContainer.checkClassMetadataAsExpected(
      Button,
      [
        {
          Metadata: Component,
          fieldValues: { scope: Component.Scope.Singleton },
        },
      ]
    );
    expect(asExpected).toBe(true);
    const target = _test_helper.iocContainer.checkClassMetadataAsExpected(
      Target,
      [
        {
          Metadata: Target,
          fieldValues: { value: [Target.Type.Class] },
        },
      ]
    );
    expect(target).toEqual(true);
    const component = _test_helper.iocContainer.checkClassMetadataAsExpected(
      Component,
      [
        {
          Metadata: Target,
          fieldValues: { value: [Target.Type.Class, Target.Type.Method] },
        },
      ]
    );
    expect(component).toEqual(true);
  });
});
