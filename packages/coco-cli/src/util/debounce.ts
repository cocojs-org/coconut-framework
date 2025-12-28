export function debounce(fn: Function, delay = 50) {
    let timer = null;
    return function (...args: any) {
        // 每次触发，先清空之前的定时器（重置延迟）
        if (timer) clearTimeout(timer);

        // 重新设置定时器，延迟执行
        timer = setTimeout(() => {
            fn.apply(this, args);
            timer = null;
        }, delay);
    };
}
