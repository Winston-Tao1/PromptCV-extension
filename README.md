# PromptCV - 专业AI提示词管理器 💡

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-orange)

**专业的Chrome浏览器扩展，帮助您管理和组织AI提示词**

[English](#english) | [中文](#chinese)

</div>

---

## 🌟 特性

### 核心功能
- ✨ **收藏管理** - 快速收藏常用提示词，一键访问
- 📜 **历史记录** - 自动记录最近使用的提示词，最多保存20条
- 📚 **提示词库** - 集中管理所有提示词，支持最多20条存储
- ➕ **快速添加** - 简洁的表单界面，轻松创建新提示词
- 📋 **一键复制** - 点击即可复制提示词到剪贴板
- ⭐ **收藏标记** - 星标标记重要提示词，方便快速定位

### 设计特色
- 🎨 **Google风格** - 采用Google Material Design设计语言
- 🌈 **彩虹边框** - 四边彩虹流动动画，美观大方
- 💫 **流畅动画** - 精心设计的过渡效果和交互反馈
- 📱 **响应式布局** - 适配不同屏幕尺寸
- 🔔 **Toast通知** - 优雅的操作反馈提示

### 技术亮点
- 💾 **Chrome同步** - 使用Chrome Storage API，数据云端同步
- 🔒 **数据安全** - 所有数据存储在本地和Chrome云端
- ⚡ **高性能** - 轻量级设计，快速响应
- 🎯 **智能限制** - 自动维护20条记录上限，删除旧数据

---

## 📦 安装指南

### 方式一：开发者模式安装（推荐）

1. **克隆或下载项目**
   ```bash
   git clone https://github.com/your-username/PromptCV-extension.git
   cd PromptCV-extension
   ```

2. **生成图标文件**
   - 在浏览器中打开 `generate-icons.html`
   - 点击"下载全部图标"按钮
   - 将下载的4个图标文件保存到 `icons/` 文件夹

3. **加载扩展到Chrome**
   - 打开Chrome浏览器
   - 访问 `chrome://extensions/`
   - 开启右上角的"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择项目文件夹

4. **开始使用**
   - 点击浏览器工具栏中的PromptCV图标
   - 享受高效的提示词管理体验！

### 方式二：Chrome Web Store（即将推出）

敬请期待Chrome Web Store上架...

---

## 🚀 使用指南

### 快速开始

#### 1. 添加提示词
1. 点击"添加"标签页
2. 选择目标AI应用（DeepSeek、Gemini、ChatGPT等）
3. 输入完整的提示词内容
4. 点击"保存并复制"按钮
5. 提示词自动保存并复制到剪贴板

#### 2. 浏览提示词
- **收藏页** - 查看所有收藏的提示词
- **历史页** - 查看最近复制的提示词
- **全部页** - 按时间顺序查看所有提示词

#### 3. 复制提示词
- 点击卡片上的"复制"按钮
- 或直接点击卡片任意位置
- 自动复制并添加到历史记录

#### 4. 管理收藏
- 点击卡片右上角的⭐按钮
- 收藏的提示词会显示在"收藏"页
- 再次点击可取消收藏

### 高级技巧

#### 提示词最佳实践
```
✅ 清晰描述任务目标
✅ 提供具体的上下文信息
✅ 使用结构化的格式（如编号列表）
✅ 指定期望的输出格式
✅ 包含示例（如果适用）
```

#### 组织提示词
- 使用应用分类区分不同AI平台的提示词
- 收藏常用的提示词以便快速访问
- 定期清理不再使用的提示词（系统自动保留最新20条）

---

## 📁 项目结构

```
PromptCV-extension/
├── manifest.json          # Chrome扩展配置文件
├── popup.html            # 弹窗HTML结构
├── popup.js              # 核心JavaScript逻辑
├── styles.css            # 样式表
├── background.js         # 后台服务脚本
├── generate-icons.html   # 图标生成工具
├── icons/                # 图标文件夹
│   ├── icon16.png       # 16x16 图标
│   ├── icon32.png       # 32x32 图标
│   ├── icon48.png       # 48x48 图标
│   └── icon128.png      # 128x128 图标
└── README.md            # 项目文档
```

---

## 🛠️ 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 现代样式和动画
- **JavaScript (ES6+)** - 异步编程和类
- **Chrome Extension API** - 浏览器扩展功能
- **Chrome Storage API** - 数据持久化和同步

---

## 🎨 设计规范

### 配色方案
```css
--google-blue:    #4285F4  /* Google蓝 */
--google-red:     #EA4335  /* Google红 */
--google-yellow:  #FBBC05  /* Google黄 */
--google-green:   #34A853  /* Google绿 */
--google-gray:    #F8F9FA  /* 背景灰 */
```

### 边框动画
- 顶部：蓝→红→黄→绿 流动
- 右侧：绿→蓝→红→黄 流动
- 底部：黄→绿→蓝→红 流动
- 左侧：蓝→红→黄→绿 流动

---

## 📊 数据管理

### 存储限制
- 提示词库：最多20条
- 历史记录：最多20条
- 自动删除：超出限制时删除最旧的记录

### 数据同步
- 使用Chrome Storage Sync API
- 自动跨设备同步
- 需要登录Chrome账户

### 数据格式
```javascript
{
  prompts: [
    {
      id: "timestamp",
      app: "deepseek|gemini|chatgpt|claude|other",
      content: "提示词内容",
      isFavorite: true|false,
      createdAt: "ISO 8601 时间戳"
    }
  ],
  history: [
    {
      promptId: "对应提示词ID",
      copiedAt: "ISO 8601 时间戳"
    }
  ]
}
```

---

## 🔧 开发指南

### 本地开发

1. **修改代码**
   ```bash
   # 编辑 popup.html, popup.js, styles.css
   ```

2. **重新加载扩展**
   - 访问 `chrome://extensions/`
   - 点击扩展卡片上的刷新按钮
   - 或使用快捷键：Ctrl+R（在扩展页面）

3. **调试技巧**
   - 右键点击扩展图标 → 检查弹出内容
   - 打开开发者工具查看Console
   - 使用 `chrome.storage` 查看存储数据

### 代码规范
- 使用ES6+语法
- 异步操作使用async/await
- 保持代码整洁和注释
- 遵循Material Design原则

---

## 🐛 故障排除

### 常见问题

**Q: 扩展图标不显示？**
A: 确保 `icons/` 文件夹中有所有必需的图标文件（16, 32, 48, 128像素）

**Q: 数据没有同步？**
A: 检查是否登录了Chrome账户，并且开启了同步功能

**Q: 复制功能不工作？**
A: 确保浏览器允许剪贴板访问权限

**Q: 提示词超过20条后消失？**
A: 系统自动保留最新的20条记录，旧记录会被自动删除

---

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

1. Fork本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启Pull Request

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📧 联系方式

- 项目主页: [GitHub Repository](https://github.com/your-username/PromptCV-extension)
- 问题反馈: [GitHub Issues](https://github.com/your-username/PromptCV-extension/issues)
- 邮箱: your-email@example.com

---

## 🙏 致谢

- 设计灵感来自Google Material Design
- 感谢所有贡献者和使用者的支持

---

## 📝 更新日志

### v1.0.0 (2025-12-26)
- 🎉 初始版本发布
- ✨ 核心功能实现：收藏、历史、全部、添加
- 🎨 Google风格UI设计
- 🌈 彩虹边框动画
- 💾 Chrome Storage同步支持
- 📋 一键复制功能
- ⭐ 收藏管理
- 🔔 Toast通知系统

---

<div align="center">

**Made with ❤️ for AI Enthusiasts**

⭐ 如果这个项目对你有帮助，请给个Star！

</div>
