// PromptCV Background Service Worker
// 处理扩展安装和更新事件

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('PromptCV 已安装！');
    
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
    console.log('PromptCV 已更新到版本:', chrome.runtime.getManifest().version);
    
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

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getVersion') {
    sendResponse({ version: chrome.runtime.getManifest().version });
    return true;
  }
  
  if (request.action === 'polishPrompt') {
    // Handle AI polish prompt request
    polishPromptWithAI(request.content, request.config)
      .then(polishedContent => {
        sendResponse({ success: true, polishedContent });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep message channel open for async response
  }
  
  if (request.action === 'reversePrompt') {
    // Handle AI reverse prompt request
    reversePromptWithAI(request.content, request.config)
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

// Reverse prompt with AI
async function reversePromptWithAI(content, config) {
  const { baseUrl, apiKey, modelName } = config;
  
  console.log('[AI Reverse] Starting with config:', { baseUrl, modelName, apiKeyLength: apiKey?.length });
  
  if (!baseUrl || !apiKey || !modelName) {
    throw new Error('模型配置不完整');
  }
  
  try {
    // Prepare the API request
    const endpoint = baseUrl.endsWith('/') ? baseUrl + 'chat/completions' : baseUrl + '/chat/completions';
    console.log('[AI Reverse] Endpoint:', endpoint);
    
    const requestBody = {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个提示词分析专家。你的任务是根据AI生成的内容，推测最可能产生这个输出的提示词。请分析用户可能的意图、格式要求和关键词，然后给出推测的完整提示词。直接给出提示词，不需要额外解释。'
        },
        {
          role: 'user',
          content: `请分析以下AI生成的内容，推测出最可能产生这个输出的提示词：\n\n${content}\n\n请直接给出推测的提示词，不需要其他解释。`
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    };
    
    console.log('[AI Reverse] Request body:', JSON.stringify(requestBody, null, 2));
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('[AI Reverse] Response status:', response.status);
      console.log('[AI Reverse] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI Reverse] Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.error?.message || errorData.message || `API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('[AI Reverse] Response text:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('[AI Reverse] Parsed response:', JSON.stringify(data, null, 2));
      
      // Extract reversed prompt from response
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const reversedPrompt = data.choices[0].message.content.trim();
        console.log('[AI Reverse] Success! Reversed prompt length:', reversedPrompt.length);
        return reversedPrompt;
      } else {
        console.error('[AI Reverse] Invalid response format:', data);
        throw new Error('API返回格式错误');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      }
      throw fetchError;
    }
    
  } catch (error) {
    console.error('[AI Reverse] Failed:', error);
    throw error;
  }
}

// Polish prompt with AI
async function polishPromptWithAI(content, config) {
  const { baseUrl, apiKey, modelName } = config;
  
  console.log('[AI Polish] Starting with config:', { baseUrl, modelName, apiKeyLength: apiKey?.length });
  
  if (!baseUrl || !apiKey || !modelName) {
    throw new Error('模型配置不完整');
  }
  
  try {
    // Prepare the API request
    const endpoint = baseUrl.endsWith('/') ? baseUrl + 'chat/completions' : baseUrl + '/chat/completions';
    console.log('[AI Polish] Endpoint:', endpoint);
    
    const requestBody = {
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的提示词优化助手。你的任务是优化用户提供的提示词，使其更加清晰、专业、有效。请保持原意的同时，改进措辞、结构和逻辑。'
        },
        {
          role: 'user',
          content: `请优化以下提示词，使其更加专业和有效：\n\n${content}`
        }
      ],
      temperature: 0.7,
      top_p: 0.9,
      stream: false
    };
    
    console.log('[AI Polish] Request body:', JSON.stringify(requestBody, null, 2));
    
    // Add timeout to fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    try {
      // Make API request
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('[AI Polish] Response status:', response.status);
      console.log('[AI Polish] Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[AI Polish] Error response:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }
        
        throw new Error(errorData.error?.message || errorData.message || `API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      console.log('[AI Polish] Response text:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('[AI Polish] Parsed response:', JSON.stringify(data, null, 2));
      
      // Extract polished content from response
      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        const polishedContent = data.choices[0].message.content.trim();
        console.log('[AI Polish] Success! Polished content length:', polishedContent.length);
        return polishedContent;
      } else {
        console.error('[AI Polish] Invalid response format:', data);
        throw new Error('API返回格式错误');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      }
      throw fetchError;
    }
    
  } catch (error) {
    console.error('[AI Polish] Failed:', error);
    throw error;
  }
}
