# <%= name %>

## 开发

```bash
# 安装依赖
npm install

# 本地开发
npm run dev

# 构建 JS
npm run build:lib

# 构建样式
npm run build:css

# 同时构建 JS 和样式
npm run build
```

### 样式文件

- `src/input.css` - 样式入口文件
- `dist/bundle.css` - 构建后的样式文件
- `tailwind.config.js` - Tailwind 配置文件

### 使用方式

1. 在项目中引入 `dist/bundle.css`

### 自定义样式

如需自定义样式，可以修改 `tailwind.config.js` 配置文件。
