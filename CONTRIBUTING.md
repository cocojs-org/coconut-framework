# 贡献指南

## 代码结构

代码仓库基于pnpm的 monorepo 结构，不同功能拆分出不同子包。

-   `coco-assign-class-id-transformer`: 基于`babel-parser`的 transformer，为有装饰器的类添加静态$$id属性。
-   `coco-cli`: 命令行，基于webpack的应用开发、构建工具，以及基于 rollup 的组件库构建工具。
-   `coco-ioc-container`: ioc容器，核心，在标准 es 装饰器规范之上封装了一套基于类和元数据的运行时框架。
-   `coco-mvc`: 框架入口，所有的运行时装饰器和组件都在这里导出。
-   `coco-mvc-rollup-plugin`: 打包工具库时需要的rollup插件。
-   `coco-mvc-webpack-loader`: 打包应用时需要的webpack loader。
-   `coco-render`: 渲染组件。
-   `coco-router`: 客户端路由组件。
-   `coco-type-extractro`: 基于`ts-pacther`的transformer，提供提取类型参数的功能。
-   `coco-view`: 视图层装饰器、组件。
-   `react`: 和react仓库下react包保持同步
-   `react-dom`: 和react仓库下react-dom包保持同步
-   `react-reconciler`: 和react仓库下react-reconciler包保持同步
-   `react-shared`: 和react仓库下shared包保持同步
-   `shared`: 全项目共享功能

## 环境

-   `nodejs`: v18及以上Lts版本
-   `pnpm`: 和`package.json`中版本保持一致

## 脚本

-   `pnpm run build`: 构建正式包
-   `pnpm run build:test`: 构建测试包
-   `pnpm run test:coconut`: 运行cocojs测试用例
-   `pnpm run test:react`: 运行React测试用例
-   `pnpm run test`: 执行测试，相当于`pnpm run build:test && pnpm run test:coconut && pnpm run test:react`

## 版本规范

-   `@cocojs/cli`和`@cocojs/mvc`都遵循[semver](https://semver.org/lang/zh-CN/)规范。
-   `@cocojs/cli`和`@cocojs/mvc`2个包的版本号遵循主版本号一致，次版本号、修订号不一致的规则，这样可以保证一定的灵活性，但又不会过于混乱。

## 发布
仓库有以下包需要发布：
- @cocojs/cli
- @cocojs/mvc
- @cocojs/type-extractor
- @cocojs/babel-plugin
- @cocojs/webpack-loader

步骤如下：
1. 在根目录下执行`changeset`，然后按照命令行的提醒选择要发布的包，目前除了`@cocojs/type-extractor`之外都处于`alpha`阶段。
2. 在自己的 fork 仓库中提交 pr 请求到中心仓库 master 分支。
3. action 会自动运行，然后创建一个新版本的 pr 请求。
4. 管理员合并 pr 后，会自动发布新的版本。
特别注意：
1. 如果是第一版使用oidc发布有点问题，所以可以在本地发布，版本号类似`0.0.1-alpha202512141`即可。后续使用action发布会正常升级到`0.0.1-alpha.0`