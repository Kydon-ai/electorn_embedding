# Electron Embedding Lab

基于 Electron + TypeScript 的单页面 Web 容器。应用启动后直接打开 `.env` 中的 `CURRENT_URL`，不显示项目选择页。Windows 发布包使用 `electron-builder` 生成 NSIS 安装包和 ZIP 免安装包。

## 配置目标地址

打包前在项目根目录的 `.env` 中指定唯一页面地址：

```dotenv
CURRENT_URL="http://127.0.0.1:5173/"
```

`.env` 已加入 Git 忽略。开发模式读取项目根目录的 `.env`；打包时会把该文件复制到应用的 `resources/.env`，所以发布包会使用打包时配置的地址。更换目标页面后重新打包即可。

配置值必须是完整的 HTTP 或 HTTPS URL。使用本地 HTTP 服务而不是 `file://`，可以避免浏览器把页面来源识别为 `null`，从而触发后端 CORS 拒绝。

## 开发和打包

```powershell
npm install
npm run dev
```

应用启动后直接打开 `CURRENT_URL` 指向的页面。

Windows 生成 NSIS 安装包和 ZIP 包：

```powershell
npm run package:win
```

输出位于 `release/`。只生成未安装的应用目录用于快速验证：

```powershell
npm run package:dir
```

打包前先运行类型检查：

```powershell
npm run typecheck
```

页面在隔离的 Electron 窗口中打开，不注入 Node.js 或 preload API。外站链接交由系统浏览器打开。
