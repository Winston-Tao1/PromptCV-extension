// Prompt Background Service Worker
// 处理扩展安装和更新事件

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Prompt 已安装！');
    
    // 初始化云同步存储（提示词、历史记录）
    chrome.storage.sync.set({
      prompts: [],
      history: [],
      settings: {
        maxPrompts: 20,
        maxHistory: 20
      }
    });
    
    // 初始化本地存储（缓存数据）
    chrome.storage.local.set({
      cacheData: {
        content: '',
        files: [],
        lastModified: null
      }
    });
  } else if (details.reason === 'update') {
    console.log('Prompt 已更新到版本:', chrome.runtime.getManifest().version);
    
    // 版本更新时，处理旧数据迁移
    chrome.storage.local.get(['prompts', 'history'], (localData) => {
      // 如果在 local 中发现提示词或历史记录，迁移到 sync
      if ((localData.prompts && localData.prompts.length > 0) || 
          (localData.history && localData.history.length > 0)) {
        console.log('检测到本地存储的提示词数据，迁移到云同步...');
        
        chrome.storage.sync.set({
          prompts: localData.prompts || [],
          history: localData.history || [],
          settings: {
            maxPrompts: 20,
            maxHistory: 20
          }
        }, () => {
          console.log('提示词数据已迁移到云同步！');
          
          // 从 local 中删除已迁移的数据
          chrome.storage.local.remove(['prompts', 'history', 'settings'], () => {
            console.log('已清理本地存储中的提示词数据');
          });
        });
      }
      
      // 处理旧版本的 cloudData 迁移到 cacheData
      chrome.storage.sync.get(['cloudData'], (syncData) => {
        if (syncData.cloudData) {
          console.log('检测到旧版云盘数据，迁移到本地缓存...');
          
          chrome.storage.local.set({
            cacheData: syncData.cloudData
          }, () => {
            console.log('云盘数据已迁移到本地缓存！');
            
            // 从 sync 中删除旧的 cloudData
            chrome.storage.sync.remove(['cloudData'], () => {
              console.log('已清理云端的旧云盘数据');
            });
          });
        }
      });
    });
  }
});

// Import services
importScripts('modelService.js');
importScripts('cryptoService.js');

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVersion') {
    sendResponse({ version: chrome.runtime.getManifest().version });
    return true;
  }
  
  if (request.action === 'polishPrompt') {
    // Handle AI polish prompt request using modelService
    handlePolishPrompt(request.content, request.config)
      .then(polishedContent => {
        sendResponse({ success: true, polishedContent });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'reversePrompt') {
    // Handle AI reverse prompt request using modelService
    handleReversePrompt(request.content, request.config)
      .then(reversedPrompt => {
        sendResponse({ success: true, reversedPrompt });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  return true;
});

// Decrypt API key from config and return a config with plaintext apiKey for modelService
async function prepareConfig(config) {
  const apiKey = await cryptoService.getApiKey(config);
  if (!apiKey) {
    throw new Error('无法获取 API Key');
  }
  return {
    ...config,
    apiKey: apiKey
  };
}

// Handle polish prompt using modelService
async function handlePolishPrompt(content, config) {
  console.log('[Background] Handling polish prompt with modelService');
  
  try {
    // Decrypt API key before using
    const decryptedConfig = await prepareConfig(config);
    
    // Validate config
    const validation = modelService.validateConfig(decryptedConfig);
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.message}`);
    }
    
    const result = await modelService.polishPrompt(content, decryptedConfig);
    console.log('[Background] Polish prompt success');
    return result;
  } catch (error) {
    console.error('[Background] Polish prompt failed:', error);
    throw error;
  }
}

// Handle reverse prompt using modelService
async function handleReversePrompt(content, config) {
  console.log('[Background] Handling reverse prompt with modelService');
  
  try {
    // Decrypt API key before using
    const decryptedConfig = await prepareConfig(config);
    
    // Validate config
    const validation = modelService.validateConfig(decryptedConfig);
    if (!validation.valid) {
      throw new Error(`配置验证失败: ${validation.message}`);
    }
    
    const result = await modelService.reversePrompt(content, decryptedConfig);
    console.log('[Background] Reverse prompt success');
    return result;
  } catch (error) {
    console.error('[Background] Reverse prompt failed:', error);
    throw error;
  }
}
