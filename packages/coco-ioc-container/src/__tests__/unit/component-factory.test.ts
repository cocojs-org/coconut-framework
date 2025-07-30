import {
  addDefinition,
  addPostConstruct,
  clear,
} from '../../ioc-container/component-factory';
import {
  genClassPostConstruct,
  genFieldPostConstruct,
  genMethodPostConstruct,
} from '../../ioc-container/ioc-component-definition';

describe('component-factory', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    clear();
    jest.resetModules();
  });

  test('一个类不能被添加2次', async () => {
    let exception = false;
    class Button {}
    try {
      addDefinition(Button);
      addDefinition(Button);
      addDefinition(Button);
    } catch (e) {
      exception = true;
    }
    expect(exception).toBe(true);
  });

  test('同一个类的单个类装饰器只能添加一个对应的postConstruct', async () => {
    let exception = false;
    class Button {}
    class Meta {}
    class Meta1 {}
    function metaPostConstruct() {}
    addDefinition(Button);
    addPostConstruct(Button, genClassPostConstruct(Meta, metaPostConstruct));
    addPostConstruct(Button, genClassPostConstruct(Meta1, metaPostConstruct));
    expect(exception).toBe(false);
    try {
      addPostConstruct(Button, genClassPostConstruct(Meta, metaPostConstruct));
    } catch (e) {
      exception = true;
    }
    expect(exception).toBe(true);
  });

  test('同一个类的单个field装饰器只能添加一个对应的postConstruct', async () => {
    let exception = false;
    class Button {}
    class Meta {}
    class Meta1 {}
    function metaPostConstruct() {}
    addDefinition(Button);
    addPostConstruct(
      Button,
      genFieldPostConstruct(Meta, metaPostConstruct, 'field')
    );
    addPostConstruct(
      Button,
      genFieldPostConstruct(Meta1, metaPostConstruct, 'field')
    );
    expect(exception).toBe(false);
    try {
      addPostConstruct(
        Button,
        genFieldPostConstruct(Meta, metaPostConstruct, 'field')
      );
    } catch (e) {
      exception = true;
    }
    expect(exception).toBe(true);
  });

  test('同一个类的单个method装饰器只能添加一个对应的postConstruct', async () => {
    let exception = false;
    class Button {}
    class Meta {}
    class Meta1 {}
    function metaPostConstruct() {}
    addDefinition(Button);
    addPostConstruct(
      Button,
      genMethodPostConstruct(Meta, metaPostConstruct, 'fn')
    );
    addPostConstruct(
      Button,
      genMethodPostConstruct(Meta1, metaPostConstruct, 'fn')
    );
    expect(exception).toBe(false);
    try {
      addPostConstruct(
        Button,
        genFieldPostConstruct(Meta, metaPostConstruct, 'fn')
      );
    } catch (e) {
      exception = true;
    }
    expect(exception).toBe(true);
  });
});
