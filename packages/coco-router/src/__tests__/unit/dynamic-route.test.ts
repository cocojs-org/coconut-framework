import DynamicRoute from '../../../src/router/dynamic-route';

describe('DynamicRoute', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    jest.resetModules();
  });

  test('不带:则直接抛出异常', async () => {
    let shouldThrowError = false;
    try {
      new DynamicRoute('/user/list');
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });

  test('匹配单个动态参数', async () => {
    const route = new DynamicRoute('/user/:id');
    const params = route.match('/user/zhangsan');
    expect(params).toEqual({ id: 'zhangsan' });
  });

  test('只有/相同，才能正确匹配上', async () => {
    const route = new DynamicRoute('/user/:id');
    const params = route.match('/user/zhangsan/info');
    expect(params).toBe(null);
  });
});
