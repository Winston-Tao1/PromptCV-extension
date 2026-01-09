/**
 * Model Service - 统一的AI模型调用服务
 * 支持润色、反推等功能，并为多供应商扩展做好准备
 */

class ModelService {
  constructor() {
    this.defaultTimeout = 60000; // 60秒超时
    this.maxRetries = 2; // 最大重试次数
  }

  /**
   * 核心模型调用方法
   * @param {Object} config - 模型配置 {baseUrl, apiKey, modelName}
   * @param {Array} messages - 消息数组
   * @param {Object} options - 调用选项 {timeout, temperature, stream}
   * @returns {Promise<string>} - 模型响应内容
   */
  async callModel(config, messages, options = {}) {
    const { baseUrl, apiKey, modelName } = config;
    
    if (!baseUrl || !apiKey || !modelName) {
      throw new Error('模型配置不完整');
    }

    const {
      timeout = this.defaultTimeout,
      temperature = 0.7,
      stream = false
    } = options;

    const endpoint = baseUrl.endsWith('/') 
      ? baseUrl + 'chat/completions' 
      : baseUrl + '/chat/completions';

    const requestBody = {
      model: modelName,
      messages,
      temperature,
      stream
    };

    console.log('[ModelService] Request:', {
      endpoint,
      modelName,
      messageCount: messages.length,
      timeout
    });

    // 尝试调用（支持重试）
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        const result = await this._makeRequest(endpoint, apiKey, requestBody, timeout);
        
        if (attempt > 1) {
          console.log(`[ModelService] 第${attempt}次尝试成功`);
        }
        
        return result;
      } catch (error) {
        if (attempt <= this.maxRetries) {
          console.warn(`[ModelService] 第${attempt}次尝试失败，${attempt < this.maxRetries ? '重试中...' : '最后一次尝试...'}`, error.message);
          // 等待一段时间后重试
          await this._sleep(1000 * attempt);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * 内部请求方法
   * @private
   */
  async _makeRequest(endpoint, apiKey, body, timeout) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText };
        }

        throw new Error(errorData.error?.message || errorData.message || `API请求失败: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      const data = JSON.parse(responseText);

      if (data.choices && data.choices.length > 0 && data.choices[0].message) {
        return data.choices[0].message.content.trim();
      } else {
        throw new Error('API返回格式错误');
      }
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接或稍后重试');
      }
      throw error;
    }
  }

  /**
   * 提示词润色
   * @param {string} content - 原始提示词内容
   * @param {Object} config - 模型配置
   * @param {Object} options - 调用选项
   * @returns {Promise<string>} - 润色后的提示词
   */
  async polishPrompt(content, config, options = {}) {
    const messages = [
      {
        role: 'system',
        content: '你是一个专业的提示词优化助手。你的任务是优化用户提供的提示词，使其更加清晰、专业、有效。请保持原意的同时，改进措辞、结构和逻辑。'
      },
      {
        role: 'user',
        content: `请优化以下提示词，使其更加专业和有效：\n\n${content}`
      }
    ];

    console.log('[ModelService] 开始润色提示词，长度:', content.length);
    
    const result = await this.callModel(config, messages, options);
    
    console.log('[ModelService] 润色完成，结果长度:', result.length);
    
    return result;
  }

  /**
   * 提示词反推
   * @param {string} content - AI生成的内容
   * @param {Object} config - 模型配置
   * @param {Object} options - 调用选项
   * @returns {Promise<string>} - 反推的提示词
   */
  async reversePrompt(content, config, options = {}) {
    const messages = [
      {
        role: 'system',
        content: '你是一个提示词分析专家。你的任务是根据AI生成的内容，推测最可能产生这个输出的提示词。请分析用户可能的意图、格式要求和关键词，然后给出推测的完整提示词。直接给出提示词，不需要额外解释。'
      },
      {
        role: 'user',
        content: `请分析以下AI生成的内容，推测出最可能产生这个输出的提示词：\n\n${content}\n\n请直接给出推测的提示词，不需要其他解释。`
      }
    ];

    console.log('[ModelService] 开始反推提示词，输入长度:', content.length);
    
    const result = await this.callModel(config, messages, options);
    
    console.log('[ModelService] 反推完成，结果长度:', result.length);
    
    return result;
  }

  /**
   * 供应商调用（预留接口）
   * @param {string} provider - 供应商名称 ('shengsuanyun', 'openai', 'anthropic', etc.)
   * @param {Object} config - 模型配置
   * @param {Array} messages - 消息数组
   * @param {Object} options - 调用选项
   * @returns {Promise<string>} - 模型响应内容
   */
  async callProvider(provider, config, messages, options = {}) {
    // 预留的供应商适配器接口
    // 未来可以在这里添加不同供应商的特殊处理逻辑
    
    const providerHandlers = {
      'shengsuanyun': this._callShengsuanYun.bind(this),
      'openai': this._callOpenAI.bind(this),
      'anthropic': this._callAnthropic.bind(this),
      'gemini': this._callGemini.bind(this)
    };

    const handler = providerHandlers[provider];
    
    if (handler) {
      return handler(config, messages, options);
    } else {
      // 默认使用通用调用（OpenAI兼容格式）
      console.warn(`[ModelService] 未知供应商: ${provider}，使用通用调用`);
      return this.callModel(config, messages, options);
    }
  }

  /**
   * 胜算云专用调用（预留）
   * @private
   */
  async _callShengsuanYun(config, messages, options) {
    // 胜算云可能需要的特殊处理
    return this.callModel(config, messages, options);
  }

  /**
   * OpenAI专用调用（预留）
   * @private
   */
  async _callOpenAI(config, messages, options) {
    // OpenAI可能需要的特殊处理（如函数调用、工具等）
    return this.callModel(config, messages, options);
  }

  /**
   * Anthropic专用调用（预留）
   * @private
   */
  async _callAnthropic(config, messages, options) {
    // Anthropic需要不同的API格式
    // 未来实现：转换消息格式为Anthropic兼容
    throw new Error('Anthropic供应商尚未实现');
  }

  /**
   * Gemini专用调用（预留）
   * @private
   */
  async _callGemini(config, messages, options) {
    // Gemini需要不同的API格式
    // 未来实现：转换消息格式为Gemini兼容
    throw new Error('Gemini供应商尚未实现');
  }

  /**
   * 辅助方法：延时
   * @private
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 获取支持的供应商列表
   * @returns {Array} 供应商列表
   */
  getSupportedProviders() {
    return [
      'shengsuanyun', // 胜算云（当前默认）
      'openai',       // OpenAI
      'anthropic',    // Anthropic
      'gemini',       // Google Gemini
      'custom'        // 自定义API（通用OpenAI兼容格式）
    ];
  }

  /**
   * 验证配置是否有效
   * @param {Object} config - 模型配置
   * @returns {Object} {valid: boolean, message: string}
   */
  validateConfig(config) {
    if (!config) {
      return { valid: false, message: '配置为空' };
    }

    if (!config.baseUrl) {
      return { valid: false, message: '缺少Base URL' };
    }

    if (!config.apiKey) {
      return { valid: false, message: '缺少API Key' };
    }

    if (!config.modelName) {
      return { valid: false, message: '缺少模型名称' };
    }

    // 验证URL格式
    try {
      new URL(config.baseUrl);
    } catch (e) {
      return { valid: false, message: 'Base URL格式不正确' };
    }

    return { valid: true, message: '配置有效' };
  }
}

// 导出实例（单例模式）
const modelService = new ModelService();

// 在浏览器环境中挂载到window，供Chrome扩展使用
if (typeof window !== 'undefined') {
  window.modelService = modelService;
}

// 为了兼容性，也挂载到全局作用域
if (typeof global !== 'undefined') {
  global.modelService = modelService;
}
