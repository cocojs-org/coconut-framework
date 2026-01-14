# 贡献指南

## 代码结构

代码仓库基于 pnpm 的 monorepo 结构，不同功能拆分出不同子包。以'react'开头的子包名都是 React 开源库的代码。

-   `coco-cli`: 命令行，基于webpack的应用开发、构建工具，以及基于 rollup 的组件库构建工具。
-   `coco-compiler`: 基于 ts compiler api 的转译程序，编译时给组件添加必要信息。
-   `coco-ioc-container`: ioc容器，核心，在标准 es 装饰器规范之上封装了一套基于类和元数据的运行时框架。
-   `coco-mvc`: 框架入口，所有的运行时装饰器和组件都在这里导出。
-   `coco-mvc-rollup-plugin`: 打包工具库时需要的rollup插件。
-   `coco-mvc-webpack-loader`: 打包应用时需要的webpack loader。
-   `coco-render`: 渲染组件。
-   `coco-router`: 客户端路由组件。
-   `coco-view`: 视图层装饰器、组件。
-   `react`: 和react仓库下react包保持同步。
-   `react-dom`: 和react仓库下react-dom包保持同步。
-   `react-reconciler`: 和react仓库下react-reconciler包保持同步。
-   `react-shared`: 和react仓库下shared包保持同步。
-   `shared`: 全项目共享功能。

## 修改 React 相关功能
框架中类组件和渲染功能都是复用 React 源码实现的，从实用和简单角度出发，所以复用时做了如下约定：
- 基于 18.2.0 版本，具体在[这个分支](https://github.com/cocojs-org/react/tree/cocojs-use)，修改 React 相关问题时可以参考
- 没有引入 schedular 相关源码，改为 `setTimeout` 代替
- 没有引入 concurrent mode 相关源码，也没有引入 lane 相关源码
- 没有引入 hooks 相关源码
- 生命周期函数名字改为 view 起头

## 环境

-   `nodejs`: v18及以上Lts版本
-   `pnpm`: 和`package.json`中版本保持一致

## 脚本

-   `pnpm run build`: 构建正式包
-   `pnpm run build:test`: 构建测试包
-   `pnpm run test:all`: 运行所有测试用例
-   `pnpm run test`: 执行测试，相当于`pnpm run build:test && pnpm run test:all`

## 版本规范

- `@cocojs/rollup-plugin-mvc`、`@cocojs/webpack-loader-mvc`统一遵循[semver](https://semver.org/lang/zh-CN/)规范。
- `@cocojs/cli`、`@cocojs/mvc`、`@cocojs/compiler`目前处于`0.1.0-beta.x`版本中，且一直处于`beta`版本，直到第一个正式版（`0.1.0`）发布后再遵循[semver](https://semver.org/lang/zh-CN/)规范。
- `@cocojs/cli`、`@cocojs/mvc` 、`@cocojs/compiler`这些包需要保证相互兼容且不强制一起发布，所以遵循主版本号一致，次版本号、修订号不一致的规则，这样可以保证一定的灵活性，但又不会过于混乱。

## 发布

步骤如下：
1. 在根目录下执行`changeset`：
   - `@cocojs/cli`、`@cocojs/mvc`应该一直选择**PATCH**阶段，直到正式版发布。
   - `@cocojs/rollup-plugin-mvc`、`@cocojs/webpack-loader-mvc`根据semver规范选择合适的版本升级即可。
2. 在自己的 fork 仓库中提交 pr 请求到中心仓库 master 分支。
3. action 会自动运行，然后创建一个新版本的 pr 请求。
4. 管理员合并 pr 后，会自动发布新的版本。
特别注意：
1. 如果是第一版使用oidc发布有点问题，所以可以在本地发布，版本号类似`0.0.1-alpha202512141`即可。后续使用action发布会正常升级到`0.0.1-alpha.0`
