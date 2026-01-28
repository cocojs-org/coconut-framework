/**
 * es装饰器提案测试用例
 * https://github.com/tc39/proposal-decorators
 */

describe('class装饰器', () => {
    it('类装饰器可以用来修改prototype。', () => {
        const log = [];
        function a() {
            return (value, { addInitializer }) => {
                value.prototype.updater = {
                    exec: () => {
                        log.push('newMethod');
                    },
                };
            };
        }

        @a()
        class Button {}
        class Child extends Button {}

        const btn = new Child();
        btn?.updater.exec();
        expect(log).toEqual(['newMethod']);
    });

    it('addInitializer回调在装饰器执行之后立刻执行，不用实例化。', () => {
        const log = [];
        function a() {
            log.push('evaluating decorators');
            return (value, { addInitializer }) => {
                log.push('calling decorators');
                addInitializer(function () {
                    log.push('calling addInitializer cb');
                });
            };
        }

        @a()
        class Button {
            constructor() {
                log.push('Button constructor');
            }
        }
        expect(log).toEqual(['evaluating decorators', 'calling decorators', 'calling addInitializer cb']);
    });

    it('多个类装饰器执行顺序，执行addInitializer回调顺序和calling decorator顺序一致。', () => {
        const log = [];
        function a() {
            log.push('evaluating decorator a');
            return (value, { addInitializer }) => {
                log.push('calling decorator a');
                addInitializer(function () {
                    log.push('calling decorator a addInitializer cb');
                });
            };
        }

        function b() {
            log.push('evaluating decorator b');
            return (value, { addInitializer }) => {
                log.push('calling decorator b');
                addInitializer(function () {
                    log.push('calling decorator b addInitializer cb');
                });
            };
        }

        @a()
        @b()
        class Button {}

        expect(log).toEqual([
            'evaluating decorator a',
            'evaluating decorator b',
            'calling decorator b',
            'calling decorator a',
            'calling decorator b addInitializer cb',
            'calling decorator a addInitializer cb',
        ]);
    });
});

describe('field装饰器', () => {
    it('addInitializer回调在constructor之前执行', () => {
        const log = [];
        function a() {
            log.push('evaluating decorators');
            return (value, { addInitializer }) => {
                log.push('calling decorators');
                addInitializer(function () {
                    log.push('calling addInitializer cb');
                });
            };
        }
        class Button {
            constructor() {
                log.push('Button constructor');
            }
            @a()
            count;
        }
        expect(log).toEqual(['evaluating decorators', 'calling decorators']);
        new Button();
        expect(log).toEqual([
            'evaluating decorators',
            'calling decorators',
            'calling addInitializer cb',
            'Button constructor',
        ]);
    });

    it('多个类装饰器执行顺序，执行addInitializer回调顺序和calling decorator顺序一致。', () => {
        const log = [];
        function a() {
            log.push('evaluating decorator a');
            return (value, { addInitializer }) => {
                log.push('calling decorator a');
                addInitializer(function () {
                    log.push('calling decorator a addInitializer cb');
                });
            };
        }
        function b() {
            log.push('evaluating decorator b');
            return (value, { addInitializer }) => {
                log.push('calling decorator b');
                addInitializer(function () {
                    log.push('calling decorator b addInitializer cb');
                });
            };
        }

        class Button {
            @a()
            @b()
            count;

            constructor() {
                log.push('Button constructor');
            }
        }
        expect(log).toEqual([
            'evaluating decorator a',
            'evaluating decorator b',
            'calling decorator b',
            'calling decorator a',
        ]);
        new Button();
        expect(log).toEqual([
            'evaluating decorator a',
            'evaluating decorator b',
            'calling decorator b',
            'calling decorator a',
            'calling decorator b addInitializer cb',
            'calling decorator a addInitializer cb',
            'Button constructor',
        ]);
    });
});

describe('method装饰器', () => {
    it('addInitializer回调在constructor之前执行', () => {
        const log = [];
        function a() {
            log.push('evaluating decorators');
            return (value, { addInitializer }) => {
                log.push('calling decorators');
                addInitializer(function () {
                    log.push('calling addInitializer cb');
                });
            };
        }
        class Dog {
            constructor() {
                log.push('Dog constructor');
            }
            @a()
            run() {}
        }
        expect(log).toEqual(['evaluating decorators', 'calling decorators']);
        new Dog();
        expect(log).toEqual([
            'evaluating decorators',
            'calling decorators',
            'calling addInitializer cb',
            'Dog constructor',
        ]);
    });

    it('多个类装饰器执行顺序，执行addInitializer回调顺序和calling decorator顺序一致。', () => {
        const log = [];
        function a() {
            log.push('evaluating decorator a');
            return (value, { addInitializer }) => {
                log.push('calling decorator a');
                addInitializer(function () {
                    log.push('calling decorator a addInitializer cb');
                });
            };
        }
        function b() {
            log.push('evaluating decorator b');
            return (value, { addInitializer }) => {
                log.push('calling decorator b');
                addInitializer(function () {
                    log.push('calling decorator b addInitializer cb');
                });
            };
        }

        class Dog {
            constructor() {
                log.push('Dog constructor');
            }
            @a()
            @b()
            run() {}
        }
        expect(log).toEqual([
            'evaluating decorator a',
            'evaluating decorator b',
            'calling decorator b',
            'calling decorator a',
        ]);
        new Dog();
        expect(log).toEqual([
            'evaluating decorator a',
            'evaluating decorator b',
            'calling decorator b',
            'calling decorator a',
            'calling decorator b addInitializer cb',
            'calling decorator a addInitializer cb',
            'Dog constructor',
        ]);
    });
});
