import {
    createDecoratorExp,
    type Decorator,
    type Application,
    type Kind,
    KindMethod,
    KindField,
    KindGetter,
} from 'coco-ioc-container';
import Memoized from './metadata/memoized';
import Subscriber from '../memoized/subscriber';
import { createDiagnose, DiagnoseCode, stringifyDiagnose } from 'shared';

function isArrowFunction(v: Function): boolean {
    return !v.hasOwnProperty('prototype');
}

export default createDecoratorExp(Memoized, {
    componentPostConstruct: function (metadata: Memoized, application: Application, target?: { name: string, kind: Kind}) {
        const { name, kind } = target;
        if (kind === KindMethod) {
            const fn = this[name];
            const subscriber = new Subscriber(fn.bind(this));
            this[name] = subscriber.memoizedFn;
        } else if (kind === KindField) {
            const func = this[name];
            const type = typeof func;
            if (type === 'function') {
                const bindThisFunc = isArrowFunction(func) ? func : func.bind(this);
                const subscriber = new Subscriber(bindThisFunc);
                this[name] = subscriber.memoizedFn;
            } else {
                const diagnose = createDiagnose(DiagnoseCode.CO10028, this.constructor.name, name, name, type);
                console.error(stringifyDiagnose(diagnose));
            }
        } else if (kind === KindGetter) {
            const descriptor = Object.getOwnPropertyDescriptor(this.constructor.prototype, name);
            const getter = descriptor?.get;
            if (typeof getter !== 'function') {
                console.error("不应该拿不到getter函数");
                return;
            }
            const subscriber = new Subscriber(getter.bind(this));
            const memoizedGetter = subscriber.memoizedFn;
            Object.defineProperty(this, name, {
                ...descriptor,
                get: memoizedGetter
            })
        } else {
            // 理论上不会走到这里
        }
    },
}) as () => Decorator<ClassMethodDecoratorContext>;
