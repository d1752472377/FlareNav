# FlareNav Chrome 浏览器收藏插件

配套 FlareNav (基于 Cloudflare Pages + Cloudflare D1 架构) 的 Chrome 扩展插件。

## 功能特性
1. **一键智能收藏**：自动获取当前网页的 URL、标题、Favicon 图标，并支持一键填写备注。
2. **分类与置顶**：实时读取您 FlareNav 中的所有自定义分类，支持快速归类与置顶。
3. **弹出层即时搜索**：在浏览器任意页面点击插件图标，即可实时检索 FlareNav 库中的书签并直达。
4. **右键菜单支持**：选中文本或右键任意链接，即可快速推送到 FlareNav。
5. **安全凭证鉴权**：通过 Admin Secret Token 实现安全同步。

## 本地安装步骤 (开发者模式)
1. 在 Chrome / Edge 浏览器地址栏打开 `chrome://extensions/`。
2. 开启右上角的 **「开发者模式」 (Developer mode)** 开关。
3. 点击 **「加载已解压的扩展程序」 (Load unpacked)**。
4. 选择当前项目的 `extension/` 文件夹。
5. 安装完成后，点击扩展图标或进入「选项」，填入您的 FlareNav 线上地址（例如 `https://your-nav.pages.dev`）及管理员密钥即可！
