const { transpile } = require('./_helper/transpile');

describe('component装饰器', () => {
    describe('可以解析的情况', () => {
        test('通过返回的类型，确定注入的组件类型', async () => {
            const source = `
  class Service {}
  class A {
    @component()
    hello(): Service {
      const s = new Service();
      return s;
    }
  }`;
            const decoratorExp = '@component(Service)';

            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('返回的类型没有定义，但是复合大驼峰的命名规则，也可以正常解析', async () => {
            const source = `
  class A {
    @component()
    hello(): Service {
      const s = new Service();
      return s;
    }
  }`;
            const decoratorExp = '@component(Service)';

            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });
    });

    describe('无法解析的情况', () => {
        test('没有return', async () => {
            const source = `
      class A {
        @component()
        hello() {
          return undefined;
        }
      }`;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return undefined', async () => {
            const source = `
      class A {
        @component()
        hello(): undefined {
          return undefined;
        }
      }`;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return null', async () => {
            const source = `
  class A {
    @component()
    hello(): null {
      return null;
    }
  }`;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return number', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): number {
      return 1;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return Number', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): Number {
      return Number;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return string', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): string {
      const v = '1';
      return v;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return String', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): String {
      return String;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return boolean', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): boolean {
      return true;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return Boolean', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): Boolean {
      return Boolean;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return object', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): {} {
      return {};
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return Object', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): Object {
      return Object;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return array', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): [] {
      const v = [];
      return v;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return Array', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): Array {
      return Array;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return function', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): () => void {
      const v = () => {};
      return v;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return Function', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): Function {
      return Function;
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return new Symbol()', async () => {
            const source = `
  function autowired() {}
  class A {
    @component()
    hello(): Symbol {
      return new Symbol();
    }
  }
  `;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return type', () => {
            const source = `
      type T = number;
      class A {
        @component()
        hello(): T {
          return 1;
        }
      }`;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });

        test('return interface', () => {
            const source = `
      interface T {
        name: string;
      }
      class A {
        @component()
        hello(): T {
          return { name: '1' };
        }
      }`;
            const decoratorExp = '@component()';
            const output = transpile(source);
            expect(output).toContain(decoratorExp);
        });
    });
});
