function transformStr(str: string, transformer?: (str: string) => string) {
    if (!str) {
        if (__DEV__ && typeof str !== 'string') {
            throw new Error(`请传入字符串:[${str}]`);
        }
        return str;
    }
    return transformer ? transformer(str) : str;
}
/**
 * 第一个字母改为小写，其他不变
 */
export function lowercaseFirstLetter(str: string) {
    const fn = (str: string) => str[0].toLowerCase() + str.slice(1);
    return transformStr(str, fn);
}
/**
 * 第一个字母改为大写，其他不变
 */
export function uppercaseFirstLetter(str: string) {
    const fn = (str: string) => str[0].toUpperCase() + str.slice(1);
    return transformStr(str, fn);
}

export function className2DecoratorName(className: string) {
    return `@${lowercaseFirstLetter(className)}`;
}

export function metadataInstance2DecoratorName(instance: any) {
    return `@${lowercaseFirstLetter(instance.constructor.name)}`;
}
/**
 * 是{}，不是基础数据类型，也不是function array set map...
 * @param v
 */
export function isPlainObject(v: any) {
    return Object.prototype.toString.call(v) === '[object Object]';
}

/**
 * 返回构造函数
 */
export function constructOf<T>(o: any): Class<T> {
    return o.constructor;
}

/**
 * s是否是p的直接子类，后代类不算
 * @param s
 * @param p
 * @returns boolean
 */
export function isSubClassOf(s: any, p: any) {
    return typeof s === 'function' && typeof p === 'function' && Object.getPrototypeOf(s) === p;
}

/**
 * s是否是p的后代类
 * @param s
 * @param p
 * @returns
 */
export function isDescendantOf(s: Class<any>, p: Class<any>) {
    if (typeof s !== 'function' || typeof p !== 'function') {
        return false;
    }
    // 直接相等的情况
    if (s === p) {
        return false;
    }

    let proto = Object.getPrototypeOf(s.prototype);
    while (proto) {
        if (proto === p.prototype) {
            return true;
        }
        proto = Object.getPrototypeOf(proto);
    }
    return false;
}

/**
 * 生成一个只能执行一次的函数
 * @param fn
 */
export function once(fn?: () => void): (THIS: any) => void {
    let runTimes = 0;
    const onceFn = (THIS: any) => {
        if (onceFn.fn) {
            if (runTimes === 0) {
                runTimes++;
                return onceFn.fn.call(THIS);
            }
        }
    };
    onceFn.fn = fn;
    return onceFn;
}

// 判断入参是否是类，因为class会转成function，所以不通过toString判断
export function isClass(v: any) {
    // TODO: 是否要添加类名首字母必须大写的校验
    return typeof v === 'function' && v.prototype && v.prototype.constructor === v;
}
