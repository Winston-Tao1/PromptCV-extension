// Settings Page Logic

// DOM Elements
const configForm = document.getElementById('config-form');
const baseUrlInput = document.getElementById('base-url-input');
const apiKeyInput = document.getElementById('api-key-input');
const modelNameInput = document.getElementById('model-name-input');
const configNameInput = document.getElementById('config-name-input');
const modelList = document.getElementById('model-list');
const modelEmpty = document.getElementById('model-empty');

// Constants
const MAX_MODELS = 5;
const STORAGE_KEY = 'ai_model_configs';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load logo FIRST to prevent flashing
    await loadLogo();
    
    // Record that user is now on settings page
    try {
        await chrome.storage.local.set({ lastPage: 'settings' });
    } catch (error) {
        console.error('Failed to record last page:', error);
    }
    
    // Migrate any existing plaintext API keys to encrypted format
    await migrateExistingConfigs();
    
    loadModels();
    setupEventListeners();
    restoreSettingsPageState();
});

/**
 * 迁移现有明文 API Key 到加密格式
 * 首次运行或检测到未加密配置时自动执行
 */
async function migrateExistingConfigs() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const configs = result[STORAGE_KEY] || [];
        
        if (configs.length === 0) return;
        
        const { migrated, needsUpdate } = await cryptoService.migrateConfigs(configs);
        
        if (needsUpdate) {
            await chrome.storage.local.set({ [STORAGE_KEY]: migrated });
        }
    } catch (error) {
        console.error('Failed to migrate configs:', error);
    }
}

// Load logo from storage
async function loadLogo() {
    const headerIcon = document.getElementById('settings-header-icon');
    if (!headerIcon) return;
    
    try {
        const result = await chrome.storage.local.get(['customLogo']);
        if (result.customLogo) {
            headerIcon.style.backgroundImage = `url('${result.customLogo}')`;
        } else {
            // No custom logo, clear the background image
            headerIcon.style.backgroundImage = 'none';
        }
    } catch (error) {
        console.error('Failed to load logo:', error);
        // On error, also clear the background
        headerIcon.style.backgroundImage = 'none';
    }
}

// Restore settings page state from storage
async function restoreSettingsPageState() {
    try {
        const result = await chrome.storage.local.get(['settingsPageState']);
        const state = result.settingsPageState;
        
        if (state) {
            // Check if state is not too old (less than 24 hours)
            const stateAge = new Date() - new Date(state.timestamp);
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (stateAge < maxAge) {
                // Restore form values
                if (state.baseUrl) {
                    document.getElementById('base-url-input').value = state.baseUrl;
                }
                if (state.apiKey) {
                    document.getElementById('api-key-input').value = state.apiKey;
                }
                if (state.modelName) {
                    document.getElementById('model-name-input').value = state.modelName;
                }
                if (state.configName) {
                    document.getElementById('config-name-input').value = state.configName;
                }
                // Removed notification - silent restoration
            } else {
                // State is too old, clear it
                await chrome.storage.local.remove('settingsPageState');
            }
        }
    } catch (error) {
        console.error('Failed to restore settings page state:', error);
    }
}

// Auto-save form data on input
function setupFormAutoSave() {
    const formInputs = [
        'base-url-input',
        'api-key-input', 
        'model-name-input',
        'config-name-input'
    ];
    
    formInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('input', () => {
                saveSettingsFormData();
            });
        }
    });
}

// Save current form data to storage
async function saveSettingsFormData() {
    try {
        const formData = {
            baseUrl: document.getElementById('base-url-input').value,
            apiKey: document.getElementById('api-key-input').value,
            modelName: document.getElementById('model-name-input').value,
            configName: document.getElementById('config-name-input').value,
            timestamp: new Date().toISOString()
        };
        
        await chrome.storage.local.set({ settingsPageState: formData });
    } catch (error) {
        console.error('Failed to auto-save form data:', error);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // Home button - return to popup.html
    const homeBtn = document.getElementById('home-btn');
    if (homeBtn) {
        homeBtn.addEventListener('click', async () => {
            // Clear last page record so popup won't redirect back
            await chrome.storage.local.remove(['lastPage', 'settingsPageState']);
            window.location.href = 'popup.html';
        });
    }
    
    configForm.addEventListener('submit', handleSaveConfig);
    
    // Setup form auto-save
    setupFormAutoSave();
    
    // Check if we should show navigation tabs (when accessed as default popup)
    checkNavigationMode();
}

// Check if we should show navigation tabs for main app access
async function checkNavigationMode() {
    try {
        const result = await chrome.storage.local.get(['lastPage']);
        const lastPage = result.lastPage;
        
        // If lastPage is not set or is 'settings', we're the default popup
        // Show navigation tabs to access main app
        if (!lastPage || lastPage === 'settings') {
            const navTabs = document.getElementById('nav-tabs');
            if (navTabs) {
                navTabs.style.display = 'flex';
                
                // Add click handlers for navigation tabs
                const tabButtons = navTabs.querySelectorAll('.tab-btn');
                tabButtons.forEach(btn => {
                    btn.addEventListener('click', async (e) => {
                        const tabId = btn.getAttribute('data-tab');
                        // Save current settings state before navigation
                        await saveSettingsFormData();
                        await chrome.storage.local.set({ 
                            lastPage: 'popup',
                            activeTab: tabId 
                        });
                        window.location.href = 'popup.html';
                    });
                });
            }
        }
    } catch (error) {
        console.error('Failed to check navigation mode:', error);
    }
}

// Load Models from Storage
async function loadModels() {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const configs = result[STORAGE_KEY] || [];
        
        if (configs.length === 0) {
            modelList.style.display = 'none';
            modelEmpty.style.display = 'block';
        } else {
            modelList.style.display = 'flex';
            modelEmpty.style.display = 'none';
            renderModels(configs);
        }
    } catch (error) {
        console.error('Failed to load models:', error);
        // No notification for load error
    }
}

// Render Models
function renderModels(configs) {
    modelList.innerHTML = '';
    
    configs.forEach((config, index) => {
        const modelCard = createModelCard(config, index);
        modelList.appendChild(modelCard);
    });
}

// Create Model Card (handles both encrypted and legacy configs)
function createModelCard(config, index) {
    const card = document.createElement('div');
    card.className = `model-card ${config.active ? 'active' : ''}`;
    
    const displayName = config.name || `模型 ${index + 1}`;
    // For encrypted configs, show fixed mask; for legacy plaintext, show partial mask
    const maskedApiKey = maskApiKey(config);
    
    card.innerHTML = `
        <div class="model-card-header">
            <div class="model-card-title">${displayName}</div>
            <div class="model-card-actions">
                <button class="model-toggle ${config.active ? 'active' : ''}" 
                        data-index="${index}" 
                        title="${config.active ? '关闭' : '启动'}">
                </button>
                <button class="model-delete-btn" 
                        data-index="${index}"
                        style="margin-left: 4px;">
                    删除
                </button>
            </div>
        </div>
        <div class="model-card-info">
            <div class="model-info-item">
                <span class="model-info-label"> Base URL:</span>
                <span class="model-info-value">${config.baseUrl}</span>
            </div>
            <div class="model-info-item">
                <span class="model-info-label"> API Key:</span>
                <span class="model-info-value">${maskedApiKey}</span>
            </div>
            <div class="model-info-item">
                <span class="model-info-label"> Model:</span>
                <span class="model-info-value">${config.modelName}</span>
            </div>
        </div>
    `;
    
    // Add event listeners
    const toggleBtn = card.querySelector('.model-toggle');
    const deleteBtn = card.querySelector('.model-delete-btn');
    
    toggleBtn.addEventListener('click', () => handleToggleModel(index));
    deleteBtn.addEventListener('click', () => handleDeleteModel(index));
    
    return card;
}

// Mask API Key (handles both encrypted and legacy plaintext configs)
function maskApiKey(config) {
    // Encrypted configs: show fully masked key
    if (cryptoService.isEncrypted(config)) {
        return '****(已加密)';
    }
    // Legacy plaintext configs
    const apiKey = config.apiKey;
    if (!apiKey || apiKey.length < 8) {
        return '****';
    }
    return apiKey.substring(0, 4) + '****' + apiKey.substring(apiKey.length - 4);
}

// Handle Save Config (with encryption)
async function handleSaveConfig(e) {
    e.preventDefault();
    
    const baseUrl = baseUrlInput.value.trim();
    const apiKey = apiKeyInput.value.trim();
    const modelName = modelNameInput.value.trim();
    const configName = configNameInput.value.trim();
    
    if (!baseUrl || !apiKey || !modelName) {
        // Silent validation - no notification
        return;
    }
    
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const configs = result[STORAGE_KEY] || [];
        
        // Check max models limit
        if (configs.length >= MAX_MODELS) {
            showToast('最多配置5个模型');
            return;
        }
        
        // Encrypt API key before storing
        const encryptionData = await cryptoService.encryptApiKey(apiKey);
        
        // Add new config (inactive by default, apiKey encrypted)
        const newConfig = {
            id: Date.now().toString(),
            baseUrl,
            encryptedKey: encryptionData.encryptedKey,
            iv: encryptionData.iv,
            salt: encryptionData.salt,
            algorithm: encryptionData.algorithm,
            iterations: encryptionData.iterations,
            keyLength: encryptionData.keyLength,
            modelName,
            name: configName || `模型 ${configs.length + 1}`,
            active: false,
            createdAt: new Date().toISOString()
        };
        
        configs.push(newConfig);
        
        // Save to storage
        await chrome.storage.local.set({ [STORAGE_KEY]: configs });
        
        // Reset form
        configForm.reset();
        
        // Clear saved form state
        await chrome.storage.local.remove('settingsPageState');
        
        // Reload models
        await loadModels();
        
        // No notification for success
    } catch (error) {
        console.error('Failed to save config:', error);
        // No notification for error
    }
}

// Handle Toggle Model
async function handleToggleModel(index) {
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const configs = result[STORAGE_KEY] || [];
        
        // Toggle the selected model
        const wasActive = configs[index].active;
        
        // Deactivate all models
        configs.forEach(config => config.active = false);
        
        // If it was active, deactivate it (don't reactivate)
        // If it was inactive, activate it
        if (!wasActive) {
            configs[index].active = true;
        }
        
        // Save to storage
        await chrome.storage.local.set({ [STORAGE_KEY]: configs });
        
        // Reload models
        await loadModels();
        
        // No notification for toggle
    } catch (error) {
        console.error('Failed to toggle model:', error);
        // No notification for error
    }
}

// Handle Delete Model
async function handleDeleteModel(index) {
    // Use new confirmation window instead of browser confirm
    const confirmed = await showDeleteModelConfirm();
    
    if (!confirmed) {
        return;
    }
    
    try {
        const result = await chrome.storage.local.get([STORAGE_KEY]);
        const configs = result[STORAGE_KEY] || [];
        
        // Remove config
        configs.splice(index, 1);
        
        // Save to storage
        await chrome.storage.local.set({ [STORAGE_KEY]: configs });
        
        // Reload models
        await loadModels();
        
        // No notification for delete
    } catch (error) {
        console.error('Failed to delete model:', error);
        // No notification for error
    }
}

// Show delete confirmation window for model
function showDeleteModelConfirm() {
    return new Promise((resolve) => {
        // Create modal overlay - EXACTLY LIKE delete_confirm_modal.html
        const overlay = document.createElement('div');
        overlay.className = 'delete-modal-overlay';
        
        // Create modal content with same structure as popup.js
        overlay.innerHTML = `
            <div class="delete-modal">
                <div class="delete-modal-header">
                    <h3>确认删除</h3>
                </div>
                <div class="delete-modal-body">
                    <p>是否确认删除本模型？</p>
                    <p class="delete-warning">删除后将无法恢复。</p>
                </div>
                <div class="delete-modal-footer">
                    <button class="btn-cancel">取消</button>
                    <button class="btn-delete">删除</button>
                </div>
            </div>
        `;
        
        // Add to body
        document.body.appendChild(overlay);
        
        // Get buttons
        const cancelBtn = overlay.querySelector('.btn-cancel');
        const deleteBtn = overlay.querySelector('.btn-delete');
        
        // Handle cancel
        cancelBtn.addEventListener('click', () => {
            overlay.remove();
            resolve(false);
        });
        
        // Handle delete
        deleteBtn.addEventListener('click', () => {
            overlay.remove();
            resolve(true);
        });
        
        // Handle click outside
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
                resolve(false);
            }
        });
        
        // Handle Escape key
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                resolve(false);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
        
        // Focus delete button
        deleteBtn.focus();
    });
}

// Show Toast (consistent with popup.js style)
function showToast(message) {
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

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#34A853' : type === 'error' ? '#EA4335' : '#4285F4'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 14px;
        font-weight: 500;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}
