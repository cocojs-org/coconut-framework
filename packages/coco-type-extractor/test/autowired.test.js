const { transpile } = require('./_helper/transpile');

describe('autowired装饰器', () => {
    test('复合大驼峰命名规范的标识符则设置成装饰器参数', async () => {
        const source = `
class A {
  @autowired()
  service: Service;
}`;
        const decoratorExp = '@autowired(Service)';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('标识符是类，则设置成装饰器参数', async () => {
        const source = `
class Service {}

class A {
  @autowired()
  service: Service;
}`;
        const decoratorExp = '@autowired(Service)';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('没有类型', () => {
        const source = `
class A {
  @autowired()
  user;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('undefined', () => {
        const source = `
class A {
  @autowired()
  user: undefined;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('null', () => {
        const source = `
class A {
  @autowired()
  user: null;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('string', () => {
        const source = `
class A {
  @autowired()
  user: string;
}`;
        const decoratorExp = `@autowired()`;

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('string', () => {
        const source = `
class A {
  @autowired()
  user: '123';
}`;
        const decoratorExp = `@autowired()`;

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('String', () => {
        const source = `
class A {
  @autowired()
  user: String;
}`;
        const decoratorExp = `@autowired()`;

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('String', () => {
        const source = `
const str = String('123');

class A {
  @autowired()
  user: str;
}`;
        const decoratorExp = `@autowired()`;

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('number', () => {
        const source = `
class A {
  @autowired()
  user: number;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('number', () => {
        const source = `
class A {
  @autowired()
  user: 123;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Number', () => {
        const source = `
class A {
  @autowired()
  user: Number;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Number', () => {
        const source = `
const num = Number(123);

class A {
  @autowired()
  user: num;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('boolean', () => {
        const source = `
class A {
  @autowired()
  user: boolean;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('boolean', () => {
        const source = `
class A {
  @autowired()
  user: true;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Boolean', async () => {
        const source = `
class A {
  @autowired()
  user: Boolean;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Boolean', async () => {
        const bool = Boolean(true);
        const source = `
class A {
  @autowired()
  user: bool;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('function', () => {
        function func() {}
        const source = `
class A {
  @autowired()
  user: func;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('function', () => {
        async function func() {}
        const source = `
class A {
  @autowired()
  user: func;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('function', () => {
        const func = function () {};
        const source = `
class A {
  @autowired()
  user: func;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('function', () => {
        const func = async function () {};
        const source = `
class A {
  @autowired()
  user: func;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('function', () => {
        const source = `
class A {
  @autowired()
  user: () => {};
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Function', () => {
        const source = `
class A {
  @autowired()
  user: Function;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('object', () => {
        const source = `
class A {
  @autowired()
  user: object;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('object', () => {
        const source = `
class A {
  @autowired()
  user: {};
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Object', () => {
        const source = `
class A {
  @autowired()
  user: Object;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('array', () => {
        const source = `
const array = [1, 2, 3];

class A {
  @autowired()
  user: array;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Array', () => {
        const source = `
class A {
  @autowired()
  user: Array;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('symbol', () => {
        const source = `
const symbol = Symbol('symbol');

class A {
  @autowired()
  user: symbol;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Symbol', async () => {
        const source = `
class A {
  @autowired()
  user: Symbol;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('map', async () => {
        const source = `
const map = new Map();

class A {
  @autowired()
  user: map;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Map', () => {
        const source = `
class A {
  @autowired()
  user: Map;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('set', () => {
        const source = `
const set = new Set();

class A {
  @autowired()
  user: set;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('Set', () => {
        const source = `
class A {
  @autowired()
  user: Set;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('type', () => {
        const source = `
type t = string;
class A {
  @autowired()
  user: t;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('interface', () => {
        const source = `
interface inter { name: string }
class A {
  @autowired()
  user: inter;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('record', () => {
        const source = `
class A {
  @autowired()
  user: Record<string, any>;
}`;
        const decoratorExp = '@autowired()';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });
});
