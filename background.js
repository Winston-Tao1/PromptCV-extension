// PromptCV Background Service Worker
// 处理扩展安装和更新事件

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('PromptCV 已安装！');
    
    // 初始化存储
    chrome.storage.sync.set({
      prompts: [],
      history: [],
      settings: {
        maxPrompts: 20,
        maxHistory: 20,
        syncEnabled: true
      }
    });
  } else if (details.reason === 'update') {
    console.log('PromptCV 已更新到版本:', chrome.runtime.getManifest().version);
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVersion') {
    sendResponse({ version: chrome.runtime.getManifest().version });
  }
  return true;
});
