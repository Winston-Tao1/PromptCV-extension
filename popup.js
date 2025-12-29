// PromptCV - Popup JavaScript
// Professional prompt management with Chrome Storage sync

class PromptManager {
    constructor() {
        this.prompts = [];
        this.history = [];
        this.cacheData = {
            content: '',
            files: [],
            lastModified: null
        };
        this.settings = {
            maxPrompts: 20,
            maxHistory: 20
        };
        this.autoSaveTimeout = null;
        this.init();
    }

    async init() {
        await this.loadData();
        this.initEventListeners();
        this.initEditableTitle();
        this.initLogoUpload();
        this.initCacheDisk();
        this.renderAllTabs();
    }

    // Load data from Chrome Local Storage
    async loadData() {
        try {
            const result = await chrome.storage.local.get(['prompts', 'history', 'settings', 'cacheData']);
            this.prompts = result.prompts || [];
            this.history = result.history || [];
            this.settings = result.settings || this.settings;
            this.cacheData = result.cacheData || this.cacheData;
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showToast('数据加载失败');
        }
    }

    // Save data to Chrome Local Storage
    async saveData() {
        try {
            // Enforce 20-item limits
            if (this.prompts.length > this.settings.maxPrompts) {
                this.prompts = this.prompts.slice(0, this.settings.maxPrompts);
            }
            if (this.history.length > this.settings.maxHistory) {
                this.history = this.history.slice(0, this.settings.maxHistory);
            }

            await chrome.storage.local.set({
                prompts: this.prompts,
                history: this.history,
                settings: this.settings,
                cacheData: this.cacheData
            });
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showToast('保存失败');
        }
    }

    // Initialize event listeners
    initEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId);
            });
        });

        // Save button in add form
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.addNewPrompt());
        }
    }

    // Switch tabs
    switchTab(tabId) {
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tabId);
        });

        // Show corresponding content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });

        // Render tab content
        this.renderTab(tabId);
    }

    // Render specific tab
    renderTab(tabId) {
        switch(tabId) {
            case 'favorites':
                this.renderFavorites();
                break;
            case 'history':
                this.renderHistory();
                break;
            case 'all':
                this.renderAllPrompts();
                break;
        }
    }

    // Render all tabs
    renderAllTabs() {
        this.renderFavorites();
        this.renderHistory();
        this.renderAllPrompts();
    }

    // Render favorites tab
    renderFavorites() {
        const container = document.getElementById('favorites-list');
        const emptyState = document.getElementById('favorites-empty');
        
        const favoritePrompts = this.prompts.filter(p => p.isFavorite);
        
        if (favoritePrompts.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        container.innerHTML = favoritePrompts
            .slice(0, 20)
            .map(prompt => this.createPromptCard(prompt))
            .join('');
        
        this.attachCardListeners();
    }

    // Render history tab
    renderHistory() {
        const container = document.getElementById('history-list');
        const emptyState = document.getElementById('history-empty');
        
        if (this.history.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Show most recent 20 history items
        const recentHistory = this.history.slice(0, 20);
        container.innerHTML = recentHistory.map(item => {
            const prompt = this.prompts.find(p => p.id === item.promptId);
            if (!prompt) return '';
            return this.createPromptCard(prompt, item.copiedAt);
        }).filter(card => card !== '').join('');
        
        this.attachCardListeners();
    }

    // Render all prompts tab
    renderAllPrompts() {
        const container = document.getElementById('all-list');
        const emptyState = document.getElementById('all-empty');
        
        if (this.prompts.length === 0) {
            container.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Sort by creation date (newest first), limit to 20
        const sortedPrompts = [...this.prompts]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 20);
        
        container.innerHTML = sortedPrompts
            .map(prompt => this.createPromptCard(prompt))
            .join('');
        
        this.attachCardListeners();
    }

    // Create prompt card HTML
    createPromptCard(prompt, copiedAt = null) {
        const date = copiedAt ? new Date(copiedAt) : new Date(prompt.createdAt);
        const timeStr = this.formatDate(date);
        
        // Preview text (max 120 characters)
        const preview = prompt.content.length > 120 
            ? prompt.content.substring(0, 120) + '...' 
            : prompt.content;
        
        const escapedPreview = this.escapeHtml(preview);
        
        return `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="card-header">
                    <span class="app-badge ${prompt.app}">${this.getAppName(prompt.app)}</span>
                    <button class="favorite-btn ${prompt.isFavorite ? 'favorited' : ''}" data-action="toggle-favorite" title="${prompt.isFavorite ? '取消收藏' : '收藏'}">
                    </button>
                </div>
                <div class="prompt-preview">
                    ${escapedPreview}
                </div>
                <div class="card-footer">
                    <span class="card-time">${copiedAt ? '📋 ' : '📅 '}${timeStr}</span>
                    <button class="copy-btn" data-action="copy">
                        <span>📋</span> 复制
                    </button>
                </div>
            </div>
        `;
    }

    // Add new prompt
    async addNewPrompt() {
        const appSelect = document.getElementById('app-select');
        const promptContent = document.getElementById('prompt-content');
        
        if (!appSelect.value) {
            this.showToast('请选择应用');
            return;
        }
        
        if (!promptContent.value.trim()) {
            this.showToast('请输入提示词内容');
            return;
        }
        
        const newPrompt = {
            id: Date.now().toString(),
            app: appSelect.value,
            content: promptContent.value.trim(),
            isFavorite: false,
            createdAt: new Date().toISOString()
        };
        
        // Add to beginning of prompts array
        this.prompts.unshift(newPrompt);
        
        // Enforce 20-item limit
        if (this.prompts.length > 20) {
            this.prompts = this.prompts.slice(0, 20);
        }
        
        await this.saveData();
        
        // Copy to clipboard
        await this.copyToClipboard(newPrompt.content, newPrompt.id);
        
        // Clear form
        promptContent.value = '';
        appSelect.value = '';
        
        // Switch to all tab to show the new prompt
        this.switchTab('all');
        
        this.showToast('提示词已保存并复制');
    }

    // Copy to clipboard
    async copyToClipboard(text, promptId) {
        try {
            await navigator.clipboard.writeText(text);
            
            // Add to history
            this.addToHistory(promptId);
            
            return true;
        } catch (error) {
            console.error('Copy failed:', error);
            this.showToast('复制失败');
            return false;
        }
    }

    // Add to history
    async addToHistory(promptId) {
        const historyItem = {
            promptId: promptId,
            copiedAt: new Date().toISOString()
        };
        
        // Add to beginning
        this.history.unshift(historyItem);
        
        // Enforce 20-item limit
        if (this.history.length > 20) {
            this.history = this.history.slice(0, 20);
        }
        
        await this.saveData();
        
        // Update history tab if it's active
        if (document.getElementById('history').classList.contains('active')) {
            this.renderHistory();
        }
    }

    // Toggle favorite status
    async toggleFavorite(promptId) {
        const promptIndex = this.prompts.findIndex(p => p.id === promptId);
        if (promptIndex !== -1) {
            this.prompts[promptIndex].isFavorite = !this.prompts[promptIndex].isFavorite;
            await this.saveData();
            
            // Re-render all tabs that might show this prompt
            this.renderFavorites();
            this.renderAllPrompts();
            
            // Always re-render history if it's active
            const historyTab = document.getElementById('history');
            if (historyTab && historyTab.classList.contains('active')) {
                this.renderHistory();
            }
        }
    }

    // Attach event listeners to cards (use event delegation)
    attachCardListeners() {
        // Remove any existing delegated listeners first
        const activeTabContent = document.querySelector('.tab-content.active');
        if (!activeTabContent) return;
        
        // Use event delegation on the container instead of individual elements
        const container = activeTabContent.querySelector('[id$="-list"]');
        if (!container) return;
        
        // Remove old listener if exists
        if (container._clickHandler) {
            container.removeEventListener('click', container._clickHandler);
        }
        
        // Create new click handler with event delegation
        container._clickHandler = async (e) => {
            // Handle copy button clicks
            if (e.target.closest('.copy-btn')) {
                e.stopPropagation();
                const card = e.target.closest('.prompt-card');
                const promptId = card.getAttribute('data-id');
                const prompt = this.prompts.find(p => p.id === promptId);
                
                if (prompt) {
                    const success = await this.copyToClipboard(prompt.content, promptId);
                    if (success) {
                        this.showToast('复制成功');
                    }
                }
                return;
            }
            
            // Handle favorite button clicks
            if (e.target.closest('.favorite-btn')) {
                e.stopPropagation();
                const btn = e.target.closest('.favorite-btn');
                const card = btn.closest('.prompt-card');
                const promptId = card.getAttribute('data-id');
                
                // Update UI immediately for better UX
                btn.classList.toggle('favorited');
                
                await this.toggleFavorite(promptId);
                return;
            }
            
            // Handle card clicks (open edit modal)
            const card = e.target.closest('.prompt-card');
            if (card && !e.target.closest('button')) {
                const promptId = card.getAttribute('data-id');
                const prompt = this.prompts.find(p => p.id === promptId);
                
                if (prompt) {
                    this.openEditModal(prompt);
                }
            }
        };
        
        // Attach the delegated listener
        container.addEventListener('click', container._clickHandler);
    }

    // Open edit modal - FIXED
    openEditModal(prompt) {
        // Prevent multiple modals - Check if modal already exists
        const existingModal = document.querySelector('.edit-modal-overlay');
        if (existingModal) {
            return;
        }
        
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.className = 'edit-modal-overlay';
        overlay.innerHTML = `
            <div class="edit-modal">
                <div class="edit-modal-header">
                    <span class="app-badge ${prompt.app}">${this.getAppName(prompt.app)}</span>
                    <button class="edit-modal-close" title="关闭">×</button>
                </div>
                <textarea class="edit-modal-textarea" placeholder="编辑提示词内容...">${this.escapeHtml(prompt.content)}</textarea>
                <div class="edit-modal-footer">
                    <button class="edit-modal-save">保存</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        // Focus textarea
        const textarea = overlay.querySelector('.edit-modal-textarea');
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
        
        // Close button
        overlay.querySelector('.edit-modal-close').addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeEditModal(overlay);
        });
        
        // Click overlay to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                this.closeEditModal(overlay);
            }
        });
        
        // Save button
        overlay.querySelector('.edit-modal-save').addEventListener('click', async (e) => {
            e.stopPropagation();
            const newContent = textarea.value.trim();
            if (newContent) {
                await this.saveEditedPrompt(prompt.id, newContent);
                this.closeEditModal(overlay);
            } else {
                this.showToast('内容不能为空');
            }
        });
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeEditModal(overlay);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Store handler for cleanup
        overlay._escHandler = escHandler;
    }
    
    // Close edit modal - FIXED animation timing
    closeEditModal(overlay) {
        if (!overlay || !overlay.parentNode) return;
        
        // Remove ESC handler
        if (overlay._escHandler) {
            document.removeEventListener('keydown', overlay._escHandler);
        }
        
        // Add closing class for animation
        overlay.classList.add('closing');
        
        // Remove after animation completes (200ms to match CSS)
        setTimeout(() => {
            if (overlay && overlay.parentNode) {
                overlay.remove();
            }
        }, 200);
    }
    
    // Save edited prompt
    async saveEditedPrompt(promptId, newContent) {
        const promptIndex = this.prompts.findIndex(p => p.id === promptId);
        if (promptIndex !== -1) {
            this.prompts[promptIndex].content = newContent;
            await this.saveData();
            
            // Re-render all tabs
            this.renderAllTabs();
            
            this.showToast('保存成功');
        }
    }

    // Show toast notification
    showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Show toast immediately
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove toast after 1 second
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }, 1000);
    }

    // Get app display name
    getAppName(appKey) {
        const appNames = {
            'deepseek': 'DeepSeek',
            'chatgpt': 'ChatGPT',
            'gemini': 'Gemini',
            'grok': 'Grok',
            'claude': 'Claude',
            'other': '其他应用'
        };
        return appNames[appKey] || appKey;
    }

    // Format date
    formatDate(date) {
        const now = new Date();
        const diff = now - date;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return '刚刚';
        if (minutes < 60) return `${minutes}分钟前`;
        if (hours < 24) return `${hours}小时前`;
        if (days < 7) return `${days}天前`;
        
        return date.toLocaleDateString('zh-CN', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Initialize Cache Disk (Local Storage)
    initCacheDisk() {
        const cloudEditor = document.getElementById('cloud-editor');
        if (!cloudEditor) return;

        // Load saved content from local storage
        if (this.cacheData.content) {
            cloudEditor.innerHTML = this.cacheData.content;
        }

        // Toolbar buttons
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const command = btn.getAttribute('data-command');
                
                if (command === 'hiliteColor') {
                    document.execCommand(command, false, 'yellow');
                } else {
                    document.execCommand(command, false, null);
                }
                
                cloudEditor.focus();
            });
        });

        // Font selector
        const fontSelect = document.getElementById('font-select');
        if (fontSelect) {
            fontSelect.addEventListener('change', () => {
                document.execCommand('fontName', false, fontSelect.value);
                cloudEditor.focus();
            });
        }

        // Auto-save on input
        cloudEditor.addEventListener('input', () => {
            this.scheduleAutoSave();
        });

        // Paste event for images
        cloudEditor.addEventListener('paste', (e) => {
            this.handlePaste(e);
        });

        // Upload button
        const uploadBtn = document.getElementById('cloud-upload-btn');
        const fileInput = document.getElementById('cloud-file-input');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => {
                fileInput.click();
            });

            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }

        // Save button (ritual save with feedback)
        const saveBtn = document.getElementById('cloud-save-btn');
        if (saveBtn) {
            saveBtn.addEventListener('click', async () => {
                await this.saveCacheData(true);
                this.showToast('✓ 已保存到本地缓存');
            });
        }
    }

    // Schedule auto-save (automatic local save)
    scheduleAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.autoSaveTimeout = setTimeout(async () => {
            await this.saveCacheData(false);
        }, 1000); // Auto-save after 1 second of inactivity
    }

    // Save cache data to local storage
    async saveCacheData(showToast = false) {
        const cloudEditor = document.getElementById('cloud-editor');
        if (!cloudEditor) return;

        this.cacheData.content = cloudEditor.innerHTML;
        this.cacheData.lastModified = new Date().toISOString();

        await this.saveData();

        if (showToast) {
            this.showToast('保存成功');
        }
    }

    // Handle paste event
    handlePaste(e) {
        const items = e.clipboardData.items;
        
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            
            // Handle images
            if (item.type.indexOf('image') !== -1) {
                e.preventDefault();
                
                const file = item.getAsFile();
                const reader = new FileReader();
                
                reader.onload = (event) => {
                    const img = document.createElement('img');
                    img.src = event.target.result;
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    
                    // Wrap in thumbnail container
                    const thumbnail = this.createImageThumbnail(img.src);
                    
                    // Insert at cursor position
                    const selection = window.getSelection();
                    if (selection.rangeCount > 0) {
                        const range = selection.getRangeAt(0);
                        range.deleteContents();
                        range.insertNode(thumbnail);
                        
                        // Move cursor after image
                        range.setStartAfter(thumbnail);
                        range.setEndAfter(thumbnail);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    } else {
                        document.getElementById('cloud-editor').appendChild(thumbnail);
                    }
                    
                    this.scheduleAutoSave();
                };
                
                reader.readAsDataURL(file);
                break;
            }
        }
    }

    // Handle file upload (supports any file format)
    handleFileUpload(e) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const cloudEditor = document.getElementById('cloud-editor');
        
        // Process multiple files
        Array.from(files).forEach(file => {
            const fileSize = this.formatFileSize(file.size);
            const fileExt = file.name.split('.').pop().toLowerCase() || 'file';

            // Read file as base64
            const reader = new FileReader();
            reader.onload = (event) => {
                const fileData = {
                    name: file.name,
                    size: fileSize,
                    type: file.type || 'application/octet-stream',
                    ext: fileExt,
                    data: event.target.result
                };

                // Create thumbnail
                const thumbnail = this.createFileThumbnail(fileData);
                
                // Insert at cursor position or append
                const selection = window.getSelection();
                
                if (selection.rangeCount > 0 && cloudEditor.contains(selection.anchorNode)) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(thumbnail);
                    
                    // Move cursor after thumbnail
                    range.setStartAfter(thumbnail);
                    range.setEndAfter(thumbnail);
                    selection.removeAllRanges();
                    selection.addRange(range);
                } else {
                    cloudEditor.appendChild(thumbnail);
                }

                this.scheduleAutoSave();
            };

            reader.readAsDataURL(file);
        });
        
        this.showToast(`已添加 ${files.length} 个文件`);
        e.target.value = '';
    }

    // Create file thumbnail
    createFileThumbnail(fileData) {
        const thumbnail = document.createElement('span');
        thumbnail.className = 'cloud-thumbnail';
        thumbnail.contentEditable = 'false';
        thumbnail.setAttribute('data-file', JSON.stringify(fileData));

        const icon = this.getFileIcon(fileData.ext);
        
        thumbnail.innerHTML = `
            <span class="cloud-thumbnail-icon">${icon}</span>
            <span class="cloud-thumbnail-info">
                <span class="cloud-thumbnail-name">${this.escapeHtml(fileData.name)}</span>
                <span class="cloud-thumbnail-size">${fileData.size}</span>
            </span>
            <button class="cloud-thumbnail-remove" type="button">×</button>
        `;

        // Remove button
        const removeBtn = thumbnail.querySelector('.cloud-thumbnail-remove');
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            thumbnail.remove();
            this.scheduleAutoSave();
        });

        return thumbnail;
    }

    // Create image thumbnail
    createImageThumbnail(src) {
        const container = document.createElement('span');
        container.className = 'cloud-image-thumbnail';
        container.contentEditable = 'false';

        const img = document.createElement('img');
        img.src = src;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'cloud-image-remove';
        removeBtn.type = 'button';
        removeBtn.textContent = '×';
        
        removeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            container.remove();
            this.scheduleAutoSave();
        });

        container.appendChild(img);
        container.appendChild(removeBtn);

        return container;
    }

    // Get file icon based on extension
    getFileIcon(ext) {
        const icons = {
            // Documents
            'txt': '📄',
            'doc': '📘',
            'docx': '📘',
            'pdf': '📕',
            // Spreadsheets
            'xls': '📗',
            'xlsx': '📗',
            'csv': '📗',
            // Presentations
            'ppt': '📙',
            'pptx': '📙',
            // Images
            'jpg': '🖼️',
            'jpeg': '🖼️',
            'png': '🖼️',
            'gif': '🖼️',
            'svg': '🖼️',
            // Archives
            'zip': '📦',
            'rar': '📦',
            '7z': '📦',
            // Code
            'js': '📜',
            'py': '📜',
            'java': '📜',
            'html': '📜',
            'css': '📜',
            'json': '📜',
            // Audio
            'mp3': '🎵',
            'wav': '🎵',
            'flac': '🎵',
            // Video
            'mp4': '🎬',
            'avi': '🎬',
            'mkv': '🎬',
            // Others
            'xml': '📋',
            'md': '📝'
        };
        return icons[ext.toLowerCase()] || '📄';
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Initialize logo upload
    async initLogoUpload() {
        const iconWrapper = document.getElementById('header-icon-wrapper');
        const headerIcon = document.getElementById('header-icon');
        const logoFileInput = document.getElementById('logo-file-input');

        if (!iconWrapper || !headerIcon || !logoFileInput) return;

        // Load saved logo from local storage
        try {
            const result = await chrome.storage.local.get(['customLogo']);
            if (result.customLogo) {
                headerIcon.style.backgroundImage = `url('${result.customLogo}')`;
            }
        } catch (error) {
            console.error('Failed to load custom logo:', error);
        }

        // Click to upload
        iconWrapper.addEventListener('click', () => {
            logoFileInput.click();
        });

        // Handle file selection
        logoFileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showToast('请选择图片文件');
                e.target.value = '';
                return;
            }

            // Validate file size (max 1MB for local storage)
            if (file.size > 1024 * 1024) {
                this.showToast('图片文件过大（最大1MB）');
                e.target.value = '';
                return;
            }

            // Read file as base64
            const reader = new FileReader();
            reader.onload = async (event) => {
                const logoData = event.target.result;

                // Update UI immediately
                headerIcon.style.backgroundImage = `url('${logoData}')`;

                // Save to local storage (has larger size limit than sync)
                try {
                    await chrome.storage.local.set({ customLogo: logoData });
                    this.showToast('Logo已更新');
                } catch (error) {
                    console.error('Failed to save logo:', error);
                    this.showToast('保存失败：' + error.message);
                    // Restore default logo
                    headerIcon.style.backgroundImage = "url('icons/prompt_logo.png')";
                }
            };

            reader.readAsDataURL(file);
            e.target.value = '';
        });
    }

    // Initialize editable title
    async initEditableTitle() {
        const titleElement = document.getElementById('app-title');
        if (!titleElement) return;

        // Load saved title from local storage
        try {
            const result = await chrome.storage.local.get(['appTitle']);
            if (result.appTitle) {
                titleElement.textContent = result.appTitle;
            }
        } catch (error) {
            console.error('Failed to load title:', error);
        }

        // Make title editable
        titleElement.setAttribute('contenteditable', 'false');
        
        // Click to edit
        titleElement.addEventListener('click', () => {
            titleElement.setAttribute('contenteditable', 'true');
            titleElement.classList.add('editing');
            titleElement.focus();
            
            // Select all text
            const range = document.createRange();
            range.selectNodeContents(titleElement);
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        });

        // Save on blur or Enter
        const saveTitle = async () => {
            let newTitle = titleElement.textContent.trim();
            
            // Limit to 20 characters
            if (newTitle.length > 20) {
                newTitle = newTitle.substring(0, 20);
            }
            
            // Restore default if empty
            if (!newTitle) {
                newTitle = 'PromptCV';
            }
            
            titleElement.textContent = newTitle;
            titleElement.setAttribute('contenteditable', 'false');
            titleElement.classList.remove('editing');
            
            // Save to local storage
            try {
                await chrome.storage.local.set({ appTitle: newTitle });
            } catch (error) {
                console.error('Failed to save title:', error);
            }
        };

        // Real-time character limit during editing
        const enforceCharacterLimit = () => {
            const currentText = titleElement.textContent;
            if (currentText.length > 20) {
                titleElement.textContent = currentText.substring(0, 20);
                // Move cursor to end
                const range = document.createRange();
                const selection = window.getSelection();
                range.selectNodeContents(titleElement);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        };

        titleElement.addEventListener('blur', saveTitle);
        
        titleElement.addEventListener('input', enforceCharacterLimit);
        
        titleElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                titleElement.blur();
            }
            if (e.key === 'Escape') {
                // Restore original title from local storage
                chrome.storage.local.get(['appTitle'], (result) => {
                    titleElement.textContent = result.appTitle || 'PromptCV';
                    titleElement.blur();
                });
            }
        });
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.promptManager = new PromptManager();
});
