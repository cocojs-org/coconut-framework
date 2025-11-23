const { transpile } = require('./_helper/transpile');

describe('constructorParam装饰器', () => {
    test('如果是类，将类作为参数', async () => {
        const source = `
class Service {}

@constructorParam()
class A {
  constructor(service: Service) {}
}`;
        const decoratorExp = '@constructorParam([Service])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('构造函数参数类型是自己的情况', async () => {
        const source = `
@constructorParam()
class A {
  constructor(service: A) {}
}`;
        const decoratorExp = '@constructorParam([A])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('如果传入类型，那么解析成undefined', async () => {
        const source = `
@constructorParam()
class A {
  constructor(service) {}
}`;
        const decoratorExp = '@constructorParam([undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('没有参数，那么解析成空数组', async () => {
        const source = `
@constructorParam()
class A {
  constructor() {}
}`;
        const decoratorExp = '@constructorParam([])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('遇到驼峰的标识符，如果没有明确是变量名、内部类、包装类，也可以正常解析', async () => {
        const source = `
@constructorParam()
class A {
  constructor(service: Service) {}
}`;
        const decoratorExp = '@constructorParam([Service])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是字符串相关类型', async () => {
        const source = `
const Str = String('')

@constructorParam()
class A {
  constructor(service: '', service1: Str, service2: string, service3: String) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined, undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是数字相关类型', async () => {
        const source = `
const Num = Number(22)

@constructorParam()
class A {
  constructor(service: 22, service1: Num, service2: number, service3: Number) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined, undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是布尔相关类型', async () => {
        const source = `
const Bool = Boolean(true)

@constructorParam()
class A {
  constructor(service: true, service1: Bool, service2: boolean, service3: Boolean) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined, undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是null、undefined', async () => {
        const source = `
@constructorParam()
class A {
  constructor(service: null, service1: undefined) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是对象相关类型', async () => {
        const source = `
@constructorParam()
class A {
  constructor(service: {}, service2: Object) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是数组相关类型', async () => {
        const source = `
@constructorParam()
class A {
  constructor(service: [], service2: Array) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是set相关类型', async () => {
        const source = `
const set = new Set();

@constructorParam()
class A {
  constructor(service: set, service2: Set) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是map相关类型', async () => {
        const source = `
const map = new Map();

@constructorParam()
class A {
  constructor(service: map, service2: Map) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是函数相关类型', async () => {
        const source = `
function fn() {}
const fn1 = () => {}
async function fn2() {}
const fn3 = async () => {}

@constructorParam()
class A {
  constructor(service: fn, service: fn1, service2: fn2, service3: fn3, service4: Function) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined, undefined, undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是Symbol相关类型', async () => {
        const sym = Symbol();
        const source = `
@constructorParam()
class A {
  constructor(service: sym, service2: Symbol) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });

    test('参数类型是typescript中的类型', async () => {
        const source = `
type t = string;
interface inter { name: string }

@constructorParam()
class A {
  constructor(service: t, service2: inter, service3: Record<string, any>) {}
}`;
        const decoratorExp = '@constructorParam([undefined, undefined, undefined])';

        const output = transpile(source);
        expect(output).toContain(decoratorExp);
    });
});
