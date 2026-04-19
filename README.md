# coconut-framework

`coconut-framework` 是一款基于 装饰器 的前端框架，致力于为开发者构建高内聚、低耦合的可扩展 Web 应用。

# Feature
* 一切皆是组件：无论是视图逻辑、业务领域还是工具方法，在框架中均被视为标准组件，实现极致的代码复用。
* 依赖注入(IoC)：内置类 Spring 的依赖注入机制，通过 @autowired 等装饰器实现解耦，让模块间的依赖关系清晰透明。
* 开箱即用：内置全局状态和路由管理，无需第三方库即可实现跨组件共享和路由导航。
* 面向企业级应用：天生适合大型复杂项目，通过严谨的层次结构（View / Flow / Util）规范团队开发习惯。
* 灵活的扩展性：支持自定义装饰器，允许开发者深度定制框架行为。

```typescript jsx
@view()
class Counter {
    @reactive()
    count: number = 0;

    @bind()
    handleClick() {
        this.count++;
    }
  
    render () {
        return <div onClick={this.handleClick}>{this.count}</div>
    }
}
```

## Documentation

Please read documentation in [cocojs.dev](https://cocojs.dev).

## Issues

Please open an issue at [GitHub Issues](https://github.com/cocojs-org/coconut-framework/issues).

## Contributing

Please read our [Contributing Guide](https://github.com/cocojs-org/coconut-framework/blob/main/CONTRIBUTING.md).

## License

MIT
