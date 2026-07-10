# uView Pro 迁移报告

## 当前技术栈分析

- 原项目形态：HBuilderX 根目录式 uni-app 项目，源码位于项目根目录，不是默认 `src` 目录结构。
- 原 uni-app 版本：项目未声明 `@dcloudio/*` CLI 依赖，主要依赖 HBuilderX 编译；历史编译产物在 `unpackage`。
- 原 Vue 版本：Vue2 写法，`main.js` 使用 `new Vue()`、`Vue.use()`、`Vue.prototype`。
- 原 uView 引入方式：npm 依赖 `uview-ui@^1.8.8`，`main.js` 全量注册，`App.vue` 引入 `uview-ui/index.scss`，`uni.scss` 引入 `uview-ui/theme.scss`。
- 原 easycom：`pages.json` 使用 `^u-(.*)` 指向 `uview-ui/components/u-$1/u-$1.vue`。
- 原 SCSS/主题：依赖 uView 1.x 主题变量，并在 `uni.scss` 自定义 `$uni-color-red` 和 `.u-btn--red`。
- 原配置入口：`main.js`、`App.vue`、`pages.json`、`manifest.json` 均为传统 uni-app 项目配置。

## 依赖与编译结构

- 修改文件：`package.json`、`package-lock.json`、`vite.config.js`、`index.html`。
- 修改原因：补齐 uni-app Vue3 CLI、H5、微信小程序、Vite、Sass、TypeScript 和 `uview-pro@0.6.8` 依赖；增加 H5/微信小程序 dev/build 脚本；由于项目不在 `src` 目录，脚本通过 `UNI_INPUT_DIR=%cd%` 指向根目录。
- 业务影响：不影响业务逻辑，不删除页面、不删除接口。
- 人工确认：npm audit 仍报告依赖链安全告警，未执行 `npm audit fix --force`，避免破坏性升级。

## Vue3 入口迁移

- 修改文件：`main.js`、`manifest.json`。
- 修改原因：从 Vue2 `new Vue()` 迁移为 Vue3/uni-app 的 `createSSRApp`；使用 `app.use(uViewPro)` 注册 uView Pro；保留 `$http`、`$currency`、`$url` 到 `app.config.globalProperties`，让现有页面的 `this.$http` 等业务调用继续工作；在 `manifest.json` 顶层增加 `"vueVersion": "3"`，避免 HBuilderX 或旧 CLI 使用 Vue2/webpack 编译链解析 uView Pro 的 Vue3+TS 组件。
- 业务影响：业务接口请求与工具函数调用路径保持一致。
- 人工确认：如果仍出现 `@dcloudio/vue-cli-plugin-uni` / `templateLoader.js` 报错，需要确认运行环境是 HBuilderX 4.07+ 或使用本项目的 `npm run dev:*` / `npm run build:*` 脚本，并重启 HBuilderX 清理旧编译缓存。

## uView Pro 配置迁移

- 修改文件：`pages.json`、`App.vue`、`uni.scss`。
- 修改原因：easycom 改为 uView Pro 文档要求的 `custom` 结构；全局样式从 `uview-ui` 切换到 `uview-pro`；主题变量从 `uview-pro/theme.scss` 引入。
- 业务影响：组件标签仍使用原 `u-*` 写法，大部分页面无需重写。
- 人工确认：Sass 输出 `@import` 弃用警告，来自 Sass 新版本和 uView Pro 当前样式写法，不影响构建。

## 组件 API 差异修复

- 修改文件：`pages/indexApp/rl-new/rl-new.vue`、`uni.scss`。
- 修改原因：uView Pro 支持的按钮/日历类型为 `primary | info | error | warning | success | default`，原 `type="red"` / `btn-type="red"` 不再是有效预设；改为 `error`，并通过主题变量将 error 色保持为原项目的 `#E56C95`。
- 业务影响：日历设置、弹窗、选择器、提交按钮逻辑不变。
- 人工确认：视觉颜色已尽量保持原粉色主题。

## Vue3 兼容修复

- 修改文件：`App.vue`、`pages/indexApp/jjr/jjr.vue`、`components/flipper/FlipClock.vue`。
- 修改原因：`App.vue` 中微信小程序更新 API 用条件编译限制在 `MP-WEIXIN`，避免 H5 运行时报 `wx is not defined`；`beforeDestroy` 改为 Vue3 的 `beforeUnmount`；修复 `FlipClock` 一个未闭合 `<text>` 标签，避免 Vue3 编译风险。
- 业务影响：节假日倒计时清理定时器逻辑不变；小程序更新逻辑仍仅在微信小程序端执行。
- 人工确认：暂无。

## 验证结果

- `npm install`：通过。
- `npm run build:h5`：通过。
- `npm run build:mp-weixin`：通过。
- `npm run dev:h5`：已启动，地址 `http://localhost:5173/`。
- 浏览器访问验证：`http://localhost:5173/` 返回 200；首屏 `#app` 有内容且高度正常；首页控制台未捕获项目运行 error。

## 保留范围

- 未删除页面。
- 未删除接口请求。
- 未删除日历、弹窗、列表、用户中心、倒计时、小游戏等业务代码。
- 未改动 `util/http.js`、`util/currency.js` 等请求与业务工具。
