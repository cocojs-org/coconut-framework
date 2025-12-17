declare const __DEV__: boolean;
// 执行JEST时开
declare const __TEST__: boolean;

declare interface Class<T> {
    new (...args: any): T;
    toString(): string;
    $$id?: string;
}

declare interface MetadataClass<T> {
    new (...args: any): T;
    toString(): string;
    $$id?: string;
    classDecoratorModifyPrototype?(prototype: any): void;
}
