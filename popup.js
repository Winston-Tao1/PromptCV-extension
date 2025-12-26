// PromptCV - Popup JavaScript
// Professional prompt management with Chrome Storage sync

class PromptManager {
    constructor() {
        this.prompts = [];
        this.history = [];
        this.settings = {
            maxPrompts: 20,
            maxHistory: 20,
            syncEnabled: true
        };
        this.init();
    }

    async init() {
        await this.loadData();
        this.initEventListeners();
        this.renderAllTabs();
    }

    // Load data from Chrome Storage
    async loadData() {
        try {
            const result = await chrome.storage.sync.get(['prompts', 'history', 'settings']);
            this.prompts = result.prompts || [];
            this.history = result.history || [];
            this.settings = result.settings || this.settings;
        } catch (error) {
            console.error('Failed to load data:', error);
            this.showToast('⚠️ 数据加载失败', 'error');
        }
    }

    // Save data to Chrome Storage
    async saveData() {
        try {
            // Enforce 20-item limits
            if (this.prompts.length > this.settings.maxPrompts) {
                this.prompts = this.prompts.slice(0, this.settings.maxPrompts);
            }
            if (this.history.length > this.settings.maxHistory) {
                this.history = this.history.slice(0, this.settings.maxHistory);
            }

            await chrome.storage.sync.set({
                prompts: this.prompts,
                history: this.history,
                settings: this.settings
            });
        } catch (error) {
            console.error('Failed to save data:', error);
            this.showToast('⚠️ 保存失败', 'error');
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
        
        const escapedContent = this.escapeHtml(prompt.content);
        const escapedPreview = this.escapeHtml(preview);
        
        return `
            <div class="prompt-card" data-id="${prompt.id}">
                <div class="card-header">
                    <span class="app-badge ${prompt.app}">${this.getAppName(prompt.app)}</span>
                    <button class="favorite-btn ${prompt.isFavorite ? 'favorited' : ''}" data-action="toggle-favorite" title="${prompt.isFavorite ? '取消收藏' : '收藏'}">
                    </button>
                </div>
                <div class="prompt-preview" title="${escapedContent}">
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
            this.showToast('⚠️ 请选择应用', 'warning');
            return;
        }
        
        if (!promptContent.value.trim()) {
            this.showToast('⚠️ 请输入提示词内容', 'warning');
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
        
        this.showToast('✅ 提示词已保存并复制', 'success');
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
            this.showToast('⚠️ 复制失败', 'error');
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

    // Toggle favorite status - FIXED VERSION
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
            
            const action = this.prompts[promptIndex].isFavorite ? '已收藏' : '已取消收藏';
            this.showToast(`⭐ ${action}`, 'success');
        }
    }

    // Attach event listeners to cards - FIXED VERSION
    attachCardListeners() {
        // Copy buttons
        document.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const card = btn.closest('.prompt-card');
                const promptId = card.getAttribute('data-id');
                const prompt = this.prompts.find(p => p.id === promptId);
                
                if (prompt) {
                    const success = await this.copyToClipboard(prompt.content, promptId);
                    if (success) {
                        this.showToast('✅ 已复制到剪贴板', 'success');
                    }
                }
            });
        });
        
        // Favorite buttons - FIXED: Ensure proper event handling
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                const card = btn.closest('.prompt-card');
                const promptId = card.getAttribute('data-id');
                
                // Update UI immediately for better UX
                const currentFavorited = btn.classList.contains('favorited');
                btn.classList.toggle('favorited');
                
                await this.toggleFavorite(promptId);
            });
        });
        
        // Card click (copy content)
        document.querySelectorAll('.prompt-card').forEach(card => {
            card.addEventListener('click', async (e) => {
                // Don't trigger if clicking buttons
                if (e.target.closest('button')) return;
                
                const promptId = card.getAttribute('data-id');
                const prompt = this.prompts.find(p => p.id === promptId);
                
                if (prompt) {
                    const success = await this.copyToClipboard(prompt.content, promptId);
                    if (success) {
                        this.showToast('✅ 已复制到剪贴板', 'success');
                    }
                }
            });
        });
    }

    // Show toast notification
    showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // Create new toast
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span class="toast-icon">${this.getToastIcon(type)}</span>${message}`;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
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

    // Get app logo path
    getAppLogo(appKey) {
        const logos = {
            'deepseek': 'icons/deepseek.png',
            'chatgpt': 'icons/chatgpt.png',
            'gemini': 'icons/gemini.png',
            'grok': 'icons/grok.png',
            'claude': 'icons/claude.png',
            'other': 'icons/otherAI.png'
        };
        return logos[appKey] || '';
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
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    window.promptManager = new PromptManager();
});
