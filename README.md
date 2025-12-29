# PromptCV - 专业AI提示词管理器 💡

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Chrome](https://img.shields.io/badge/chrome-extension-orange)

**强大的Chrome浏览器扩展，集提示词管理、本地缓存、富文本编辑于一体**

[功能特性](#-功能特性) | [安装指南](#-安装指南) | [使用教程](#-使用教程) | [技术文档](#-技术文档)

</div>

---

## 🌟 功能特性

### 📚 提示词管理系统
- ⭐ **智能收藏** - 星标标记重要提示词，快速访问常用内容
- 📜 **使用历史** - 自动记录最近使用的20条提示词，追踪工作流程
- 📋 **提示词库** - 集中管理所有提示词，支持多平台分类
- ➕ **快速创建** - 简洁表单界面，一键保存并复制
- 🔍 **智能分类** - 支持DeepSeek、ChatGPT、Gemini、Claude、Grok等主流AI平台
- 📝 **在线编辑** - 点击卡片即可修改提示词内容

### 💾 缓存功能（NEW v2.0）
- 📝 **富文本编辑器** - 类似Word的编辑体验
  - **文本格式化**：加粗、下划线、背景高亮
  - **字体选择**：10种中英文字体（Arial、宋体、黑体、楷体等）
  - **列表功能**：有序列表、无序列表
- 📎 **任意格式文件上传** - 无格式限制
  - 文档类：txt, doc, docx, pdf, md
  - 表格类：xls, xlsx, csv
  - 演示类：ppt, pptx
  - 图片类：jpg, png, gif, svg
  - 压缩包：zip, rar, 7z
  - 代码类：js, py, java, html, css, json
  - 音视频：mp3, wav, mp4, avi, mkv
  - **支持任意其他格式**
- 🖼️ **图片粘贴** - 直接Ctrl+V粘贴图片
- 📤 **多文件上传** - 一次选择多个文件同时上传
- 🎯 **智能插入** - 文件和图片在光标位置插入
- 🗑️ **快速删除** - 缩略图一键删除
- ⚡ **自动保存** - 1秒无操作自动保存，无需手动
- 🔒 **本地存储** - 纯本地缓存，无云端上传，隐私安全

### 🎨 个性化定制
- 🖼️ **自定义Logo** - 上传个人Logo，打造专属品牌
  - 支持所有图片格式（PNG、JPG、**GIF动图**、SVG等）
  - 最大文件大小：1MB
  - 本地存储，不占用云端空间
- ✏️ **可编辑标题** - 自定义扩展名称（最多20字符）
- 🌈 **Google风格** - Material Design设计语言
- � **流畅动画** - 精心设计的交互反馈

### 💾 数据管理
- �🔄 **智能存储** - 混合存储方案，兼顾同步与容量
  - 提示词和历史：云同步存储，跨设备访问
  - 缓存数据：本地存储，大容量空间
- 🔒 **数据安全** - 提示词云端备份，缓存本地保护
- 📊 **智能限制** - 自动维护20条记录，优化性能
- ⚡ **即时响应** - 轻量级设计，毫秒级响应
- 📦 **灵活容量** - 缓存5-10MB本地空间，提示词云端100KB

---

## 📦 安装指南

### 方式一：开发者模式安装（推荐）

1. **获取项目文件**
   ```bash
   git clone https://github.com/Winston-Tao1/PromptCV-extension.git
   cd PromptCV-extension
   ```

2. **生成扩展图标**
   - 在浏览器中打开 `generate-icons.html`
   - 点击"下载全部图标"按钮
   - 将下载的4个PNG文件保存到 `icons/` 文件夹
   - 确保文件名为：icon16.png、icon32.png、icon48.png、icon128.png

3. **加载到Chrome浏览器**
   - 打开Chrome浏览器
   - 地址栏输入：`chrome://extensions/`
   - 开启右上角"开发者模式"开关
   - 点击"加载已解压的扩展程序"
   - 选择项目根目录文件夹

4. **验证安装**
   - 工具栏出现PromptCV图标 ✅
   - 点击图标打开扩展界面 ✅
   - 功能正常使用 ✅

### 方式二：Chrome Web Store（规划中）

Chrome Web Store版本正在准备中，敬请期待...

---

## 🚀 使用教程

### 提示词管理

#### 添加新提示词
1. 点击"**添加**"标签页
2. 从下拉菜单选择AI平台（DeepSeek、ChatGPT等）
3. 在文本框输入完整提示词内容
4. 点击"**保存**"按钮
5. ✨ 提示词自动保存并复制到剪贴板

#### 浏览和使用提示词
- **收藏** - 查看所有星标提示词
- **历史** - 查看最近使用记录（最多20条）
- **全部** - 按时间倒序查看所有提示词（最多20条）

#### 快速操作
- **复制内容**：点击卡片上的"📋 复制"按钮
- **收藏/取消**：点击卡片右上角的⭐图标
- **编辑提示词**：点击卡片任意位置打开编辑器
- **保存修改**：编辑完成后点击"保存"

### 缓存功能

#### 富文本编辑
1. 点击"**缓存**"标签页
2. 在编辑区域输入或粘贴文本
3. 使用工具栏格式化内容：
   - **B** - 加粗文本
   - **U** - 添加下划线
   - **A** - 黄色背景高亮
   - **字体** - 选择字体样式
   - **☰** - 无序列表
   - **≡** - 有序列表

#### 上传文件
1. 点击绿色"**📤 上传文件**"按钮
2. 选择任意格式的文件（无限制）
3. 支持多文件同时上传
4. 文件以缩略图形式显示在光标位置
5. 点击缩略图上的 **×** 可删除文件

#### 粘贴图片
1. 复制图片到剪贴板（截图、复制图片等）
2. 在编辑区域按 **Ctrl+V**（Windows）或 **Cmd+V**（Mac）
3. 图片自动插入并显示缩略图
4. 鼠标悬停在图片上显示删除按钮

#### 保存机制
- **自动保存**：输入停止1秒后自动保存到本地
- **手动保存**：点击"**保存**"按钮触发仪式感保存并显示确认提示
- **本地存储**：所有数据仅保存在本设备浏览器中，不会上传云端
- **隐私安全**：数据完全由用户控制，无跨设备同步

### 个性化设置

#### 更换Logo
1. 鼠标悬停在左上角Logo上
2. 出现向上箭头（↑）时点击
3. 选择图片文件（最大1MB）
4. Logo立即更新

#### 修改标题
1. 点击顶部"PromptCV"标题
2. 输入新名称（最多20个字符）
3. 按Enter或点击其他位置保存
4. 按Esc取消修改

---

## 📁 项目结构

```
PromptCV-extension/
├── manifest.json              # Chrome扩展配置文件
├── popup.html                 # 主界面HTML结构
├── popup.js                   # 核心业务逻辑（700+ 行）
├── styles.css                 # 完整样式表（900+ 行）
├── background.js              # 后台服务worker
├── generate-icons.html        # 图标生成工具
├── README.md                  # 项目文档（本文件）
├── INSTALLATION.md            # 安装说明
├── CACHE_FEATURE.md           # 缓存功能详细文档
├── CLOUD_DISK_FEATURE.md      # 旧云盘功能文档（已废弃）
├── icons/                     # 图标资源文件夹
│   ├── icon16.png            # 16x16 扩展图标
│   ├── icon32.png            # 32x32 扩展图标
│   ├── icon48.png            # 48x48 扩展图标
│   ├── icon128.png           # 128x128 扩展图标
│   ├── prompt_logo.png       # 主Logo
│   ├── tabs_*.png            # 标签页图标
│   ├── add.png               # 添加图标
│   ├── star.png              # 收藏图标
│   ├── dis_star.png          # 未收藏图标
│   └── *.png                 # 其他AI平台图标
└── LICENSE                    # MIT许可证
```

---

## 🛠️ 技术文档

### 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| HTML5 | - | 语义化页面结构 |
| CSS3 | - | 样式、动画、响应式设计 |
| JavaScript | ES6+ | 核心业务逻辑 |
| Chrome Extension API | Manifest V3 | 浏览器扩展功能 |
| Chrome Storage API | Sync + Local | 混合存储（提示词云同步+缓存本地） |
| FileReader API | - | 文件和图片处理 |
| Clipboard API | - | 复制到剪贴板 |
| ContentEditable | - | 富文本编辑 |

### 核心架构

```javascript
class PromptManager {
  // 数据管理
  - prompts[]          // 提示词列表
  - history[]          // 使用历史
  - cacheData{}        // 缓存内容
  
  // 核心方法
  - init()             // 初始化应用
  - loadData()         // 加载数据
  - saveData()         // 保存数据
  - renderAllTabs()    // 渲染所有标签页
  
  // 提示词管理
  - addNewPrompt()     // 添加提示词
  - toggleFavorite()   // 切换收藏状态
  - copyToClipboard()  // 复制到剪贴板
  
  // 缓存功能
  - initCacheDisk()    // 初始化缓存
  - handleFileUpload() // 处理文件上传
  - handlePaste()      // 处理图片粘贴
  - scheduleAutoSave() // 自动保存调度
  
  // 个性化
  - initLogoUpload()   // Logo上传
  - initEditableTitle()// 标题编辑
}
```

### 数据结构

#### 提示词数据
```javascript
{
  id: "1672531200000",           // 时间戳ID
  app: "deepseek",               // AI平台
  content: "提示词内容...",       // 完整内容
  isFavorite: true,              // 是否收藏
  createdAt: "2025-01-01T00:00:00.000Z"  // 创建时间
}
```

#### 历史记录
```javascript
{
  promptId: "1672531200000",     // 关联的提示词ID
  copiedAt: "2025-01-01T00:01:00.000Z"  // 复制时间
}
```

#### 缓存数据
```javascript
{
  content: "<div>HTML内容...</div>",  // 富文本内容
  files: [],                           // 文件列表（预留）
  lastModified: "2025-01-01T00:02:00.000Z"  // 最后修改时间
}
```

### 存储策略

| 数据类型 | 存储位置 | 同步 | 大小限制 |
|---------|---------|------|---------|
| 提示词列表 | Chrome Sync | ✅ | ~100KB |
| 使用历史 | Chrome Sync | ✅ | ~100KB |
| 收藏状态 | Chrome Sync | ✅ | 包含在提示词中 |
| 缓存内容 | Chrome Local | ❌ | 5-10MB |
| 自定义Logo | Chrome Local | ❌ | 1MB |
| 扩展标题 | Chrome Local | ❌ | 20字符 |

### 性能优化

- **事件委托**：使用事件委托减少DOM监听器数量
- **防抖处理**：自动保存使用1秒防抖
- **懒加载**：仅渲染当前激活的标签页
- **批量操作**：数据修改后统一保存
- **DOM复用**：编辑模态框复用逻辑
- **本地存储**：使用Local Storage提供更大的存储空间

---

## 🎨 设计规范

### 配色方案
```css
/* Google Brand Colors */
--google-blue:      #4285F4  /* 主色调 */
--google-red:       #EA4335  /* 强调色 */
--google-yellow:    #FBBC05  /* 警告色 */
--google-green:     #34A853  /* 成功色 */
--google-gray:      #F8F9FA  /* 背景色 */
--google-dark-gray: #5F6368  /* 次要文本 */
--google-text:      #202124  /* 主要文本 */
```

### 尺寸规范
```css
/* 扩展窗口 */
宽度: 480px (固定)
高度: 510px (固定)

/* 内容区域 */
高度: 350px (可滚动)

/* 图标尺寸 */
Logo: 28x28px
标签图标: 16x16px
应用图标: 14x14px
```

### 动画效果
- **过渡时长**：200ms（快速）/ 300ms（标准）
- **缓动函数**：cubic-bezier(0.4, 0, 0.2, 1)
- **悬停反馈**：transform scale(1.05)
- **点击反馈**：transform scale(0.98)

---

## 🐛 故障排除

### 常见问题解答

#### Q1: 扩展图标不显示或显示为灰色❓
**A:** 
1. 确保 `icons/` 文件夹中包含所有必需的图标文件
2. 使用 `generate-icons.html` 工具生成图标
3. 重新加载扩展（chrome://extensions/ → 刷新）

#### Q2: 提示词或缓存数据丢失❓
**A:**
**提示词数据（云同步）：**
1. 提示词和历史记录使用云同步，登录Chrome账号后自动跨设备同步
2. 更换设备或重装浏览器后，登录同一账号即可恢复提示词数据
3. 清除"浏览数据"时注意不要清除"同步数据"

**缓存数据（本地存储）：**
1. 缓存数据仅保存在本设备，不会跨设备同步
2. 清除浏览器数据会导致缓存丢失
3. 卸载扩展会导致缓存丢失
4. 建议定期备份重要缓存内容到外部文件

#### Q3: Logo上传失败提示"保存失败"❓
**A:**
1. 检查图片文件大小是否超过1MB
2. 确保文件格式为常见图片格式（jpg、png、gif等）
3. 尝试压缩图片后重新上传
4. 使用在线图片压缩工具（如TinyPNG）

#### Q4: 缓存文件上传没有反应❓
**A:**
1. 现在支持任意格式的文件上传
2. 检查文件是否过大（建议单个文件 < 5MB）
3. 尝试使用其他文件测试
4. 查看浏览器控制台是否有错误信息
5. 支持多文件同时上传

#### Q5: 收藏功能点击无反应❓
**A:**
1. 刷新扩展页面
2. 检查浏览器控制台是否有JavaScript错误
3. 重新加载扩展
4. 如果问题持续，请提交GitHub Issue

#### Q6: 提示词超过20条后自动消失❓
**A:**
- 这是正常行为！系统自动保留最新的20条记录
- 旧记录会被自动删除以优化性能
- 建议：
  - 收藏重要的提示词（收藏的不会被删除）
  - 定期备份重要内容到外部文件
  - 使用缓存功能保存临时数据

---

## 🔧 开发指南

### 本地开发环境设置

1. **准备工作**
   ```bash
   # 克隆项目
   git clone https://github.com/Winston-Tao1/PromptCV-extension.git
   cd PromptCV-extension
   
   # 使用你喜欢的编辑器打开
   code .  # VS Code
   ```

2. **开发流程**
   ```bash
   # 1. 修改代码
   # 编辑 popup.html, popup.js, styles.css
   
   # 2. 重新加载扩展
   # 访问 chrome://extensions/
   # 点击扩展卡片上的刷新图标
   
   # 3. 测试功能
   # 点击扩展图标打开界面
   # 测试修改的功能
   ```

3. **调试技巧**
   ```javascript
   // 右键点击扩展图标 → "检查弹出内容"
   // 在控制台查看日志
   console.log('Debug info:', data);
   
   // 查看存储数据
   chrome.storage.local.get(null, (data) => {
     console.log('All local data:', data);
   });
   ```

### 代码规范

#### JavaScript风格
```javascript
// ✅ 推荐
class MyClass {
  async myMethod() {
    try {
      const result = await someAsyncFunction();
      return result;
    } catch (error) {
      console.error('Error:', error);
      this.showToast('操作失败');
    }
  }
}

// ❌ 避免
function myFunction(callback) {
  someAsyncFunction(function(result) {
    callback(result);
  });
}
```

#### CSS组织
```css
/* 1. 变量定义 */
:root {
  --primary-color: #4285F4;
}

/* 2. 全局样式 */
* { margin: 0; padding: 0; }

/* 3. 布局样式 */
.container { display: flex; }

/* 4. 组件样式 */
.button { padding: 8px 16px; }

/* 5. 动画效果 */
@keyframes fadeIn { ... }
```

### 版本发布流程

1. **更新版本号**
   ```json
   // manifest.json
   {
     "version": "2.1.0"
   }
   ```

2. **更新文档**
   - 更新 README.md 中的版本号和更新日志
   - 添加新功能说明
   - 更新截图（如有必要）

3. **测试清单**
   - [ ] 所有核心功能正常工作
   - [ ] 新功能经过充分测试
   - [ ] 无控制台错误或警告
   - [ ] 在不同Chrome版本测试
   - [ ] 数据同步功能正常

4. **提交代码**
   ```bash
   git add .
   git commit -m "Release v2.1.0: Add new features"
   git tag v2.1.0
   git push origin main --tags
   ```

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！无论是新功能、bug修复、文档改进还是问题反馈。

### 如何贡献

1. **Fork项目**
   - 访问 [GitHub仓库](https://github.com/Winston-Tao1/PromptCV-extension)
   - 点击右上角"Fork"按钮

2. **创建分支**
   ```bash
   git checkout -b feature/your-feature-name
   # 或
   git checkout -b fix/your-bug-fix
   ```

3. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   # 提交信息格式：
   # feat: 新功能
   # fix: Bug修复
   # docs: 文档更新
   # style: 代码格式调整
   # refactor: 代码重构
   # test: 测试相关
   ```

4. **推送代码**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **创建Pull Request**
   - 访问你Fork的仓库
   - 点击"New Pull Request"
   - 填写PR描述（说明你的更改内容）
   - 等待审核和合并

### 提交问题

发现Bug或有功能建议？请访问 [GitHub Issues](https://github.com/Winston-Tao1/PromptCV-extension/issues)

**Bug报告模板：**
```markdown
**描述问题**
简要描述遇到的问题

**复现步骤**
1. 打开扩展
2. 点击某个按钮
3. 看到错误信息

**预期行为**
描述你期望的正确行为

**截图**
如果可能，添加截图

**环境信息**
- Chrome版本：
- 操作系统：
- 扩展版本：
```

---

## 📄 许可证

本项目采用 **MIT License** 许可证。

这意味着您可以：
- ✅ 自由使用本项目
- ✅ 修改源代码
- ✅ 发布衍生作品
- ✅ 用于商业目的

唯一要求：保留原作者的版权声明

详见 [LICENSE](LICENSE) 文件

---

## 📧 联系方式

- **GitHub**: [@Winston-Tao1](https://github.com/Winston-Tao1)
- **项目主页**: [PromptCV Extension](https://github.com/Winston-Tao1/PromptCV-extension)
- **问题反馈**: [GitHub Issues](https://github.com/Winston-Tao1/PromptCV-extension/issues)
- **功能建议**: [GitHub Discussions](https://github.com/Winston-Tao1/PromptCV-extension/discussions)

---

## 🙏 致谢

### 设计灵感
- Google Material Design
- Chrome DevTools UI

### 技术参考
- Chrome Extension Documentation
- MDN Web Docs
- Stack Overflow Community

### 特别感谢
- 所有贡献者的代码和建议
- 用户反馈帮助改进产品
- 开源社区的支持

---

## 📝 更新日志

### v2.0.0 (2025-12-29) 🎉
**重大更新 - 混合存储方案**
- 🎉 **"云盘"重构为"缓存"功能**
  - 实现智能混合存储方案
  - 提示词和历史：Chrome Sync Storage（云同步，跨设备访问）
  - 缓存数据：Chrome Local Storage（本地存储，大容量空间）
  - 自动数据迁移机制
- ✨ **任意格式文件支持**
  - 移除文件格式限制
  - 支持多文件同时上传
  - 扩展文件图标支持（20+种文件类型）
- ⚡ **优化自动保存**
  - 自动保存延迟从2秒优化到1秒
  - 保存按钮提供仪式感反馈
- 🎨 **个性化定制**
  - 自定义Logo上传
  - 可编辑扩展标题
- 🐛 **Bug修复**
  - 修复收藏页面连续操作问题
  - 优化存储机制和数据迁移
- 📝 **文档更新**
  - 新增CACHE_FEATURE.md详细文档
  - 更新README说明混合存储方案

### v1.0.0 (2025-12-26)
**初始版本**
- ✨ 核心功能：收藏、历史、全部、添加
- 🎨 Google风格UI设计
- 🌈 彩虹边框动画
- 💾 Chrome Storage Sync支持
- 📋 一键复制功能
- ⭐ 收藏管理
- 🔔 Toast通知系统
- 📝 提示词编辑功能

---

## 🗺️ 发展路线图

### 计划中的功能（v2.1.0）
- [ ] 提示词搜索功能
- [ ] 标签分类系统
- [ ] 导出/导入功能
- [ ] 快捷键支持
- [ ] 深色模式
- [ ] 多语言支持

### 长期目标
- [ ] Chrome Web Store发布
- [ ] 团队协作功能
- [ ] AI辅助提示词优化
- [ ] 提示词模板市场
- [ ] 数据统计和分析

---

<div align="center">

### ⭐ 如果这个项目对你有帮助，请给个Star！

### 💖 Made with Love for AI Enthusiasts

**[⬆ 返回顶部](#promptcv---专业ai提示词管理器-)**

</div>
