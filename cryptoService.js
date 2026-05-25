/**
 * Crypto Service - API Key 加密存储服务
 * 使用 Web Crypto API (PBKDF2 + AES-GCM) 对敏感数据进行加密
 * 
 * 安全等级：中等（比明文存储强得多）
 * 密钥派生：extension.id + 固定 salt → PBKDF2 (100,000 iterations) → AES-GCM 256-bit
 * 
 * 注意：extension.id 在 Chrome 中可被获取，因此这不是完美的安全方案，
 * 但已足够防御 casual snooping 和 storage 读取攻击。
 */

class CryptoService {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.saltLength = 16;        // 128-bit salt
    this.ivLength = 12;          // 96-bit IV (推荐用于 GCM)
    this.iterations = 100000;    // PBKDF2 迭代次数
    this.hashAlgorithm = 'SHA-256';
    this.storageKey = '_encrypted_metadata'; // 存储加密元数据的 key
  }

  /**
   * 获取扩展 ID 作为密钥派生材料
   * @returns {string} extension ID
   */
  getExtensionId() {
    // 在 Chrome Extension 环境中使用 runtime.id
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
      return chrome.runtime.id;
    }
    // Fallback: 使用固定字符串（非 extension 环境下测试用）
    return 'promptcv-default-id';
  }

  /**
   * 获取或创建持久化 salt
   * 每个加密操作使用相同 salt（从 extension.id 派生而来）
   * @returns {Uint8Array} 16-byte salt
   */
  async getSalt() {
    // 使用固定 salt 策略：这样同一 extension 始终使用相同密钥
    // 比随机 salt 更简单且足够安全（密钥派生材料已包含 extension.id）
    const extensionId = this.getExtensionId();
    const encoder = new TextEncoder();
    const idBytes = encoder.encode(extensionId);
    
    // 使用 SHA-256 将 extension.id 哈希为固定长度的 salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', idBytes);
    return new Uint8Array(hashBuffer.slice(0, this.saltLength));
  }

  /**
   * PBKDF2 派生 AES-GCM 密钥
   * @param {Uint8Array} salt - 16-byte salt
   * @returns {Promise<CryptoKey>} AES-GCM CryptoKey
   */
  async deriveKey(salt) {
    const extensionId = this.getExtensionId();
    const encoder = new TextEncoder();
    
    // 导入密码材料（extension.id）
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(extensionId),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    // PBKDF2 派生 AES-GCM 密钥
    const cryptoKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: this.iterations,
        hash: this.hashAlgorithm
      },
      passwordKey,
      {
        name: this.algorithm,
        length: this.keyLength
      },
      false, // 不可导出
      ['encrypt', 'decrypt']
    );

    return cryptoKey;
  }

  /**
   * 加密明文 API Key
   * @param {string} plaintext - 要加密的明文
   * @returns {Promise<Object>} { encrypted: ArrayBuffer, iv: Uint8Array, salt: Uint8Array }
   */
  async encrypt(plaintext) {
    if (!plaintext || typeof plaintext !== 'string') {
      throw new Error('加密失败：输入不能为空');
    }

    try {
      const salt = await this.getSalt();
      const cryptoKey = await this.deriveKey(salt);
      const iv = crypto.getRandomValues(new Uint8Array(this.ivLength));
      const encoder = new TextEncoder();
      const encodedData = encoder.encode(plaintext);

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        cryptoKey,
        encodedData
      );

      return {
        encrypted: new Uint8Array(encryptedBuffer),
        iv: iv,
        salt: salt
      };
    } catch (error) {
      console.error('[CryptoService] 加密失败:', error.message);
      throw new Error(`加密失败: ${error.message}`);
    }
  }

  /**
   * 解密密文
   * @param {Uint8Array} encryptedData - 加密数据
   * @param {Uint8Array} iv - 初始化向量
   * @param {Uint8Array} salt - PBKDF2 salt
   * @returns {Promise<string>} 解密后的明文
   */
  async decrypt(encryptedData, iv, salt) {
    if (!encryptedData || !iv || !salt) {
      throw new Error('解密失败：缺少必要的加密参数');
    }

    try {
      const cryptoKey = await this.deriveKey(salt);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        cryptoKey,
        encryptedData
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      console.error('[CryptoService] 解密失败:', error.message);
      throw new Error(`解密失败: ${error.message}`);
    }
  }

  /**
   * ArrayBuffer/Uint8Array 转 Base64 字符串
   * @param {Uint8Array|ArrayBuffer} buffer
   * @returns {string} Base64 编码字符串
   */
  toBase64(buffer) {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Base64 字符串转 Uint8Array
   * @param {string} base64 - Base64 编码字符串
   * @returns {Uint8Array}
   */
  fromBase64(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * 加密 API Key 并返回可用于存储的对象
   * @param {string} apiKey - 原始 API Key
   * @returns {Promise<Object>} { encryptedKey, iv, salt, algorithm, iterations }
   */
  async encryptApiKey(apiKey) {
    const { encrypted, iv, salt } = await this.encrypt(apiKey);
    
    return {
      encryptedKey: this.toBase64(encrypted),
      iv: this.toBase64(iv),
      salt: this.toBase64(salt),
      algorithm: this.algorithm,
      iterations: this.iterations,
      keyLength: this.keyLength
    };
  }

  /**
   * 解密 API Key 从存储对象
   * @param {Object} encryptedPackage - { encryptedKey, iv, salt, ... }
   * @returns {Promise<string>} 原始 API Key
   */
  async decryptApiKey(encryptedPackage) {
    const { encryptedKey, iv, salt } = encryptedPackage;
    
    if (!encryptedKey || !iv || !salt) {
      throw new Error('加密数据包不完整');
    }

    const encryptedBytes = this.fromBase64(encryptedKey);
    const ivBytes = this.fromBase64(iv);
    const saltBytes = this.fromBase64(salt);

    return await this.decrypt(encryptedBytes, ivBytes, saltBytes);
  }

  /**
   * 检查配置中的 apiKey 是否已加密
   * @param {Object} config - 模型配置对象
   * @returns {boolean}
   */
  isEncrypted(config) {
    return config && config.encryptedKey && config.iv && config.salt;
  }

  /**
   * 从配置中获取解密后的 API Key
   * @param {Object} config - 模型配置对象
   * @returns {Promise<string>} 解密后的 API Key
   */
  async getApiKey(config) {
    if (this.isEncrypted(config)) {
      return await this.decryptApiKey({
        encryptedKey: config.encryptedKey,
        iv: config.iv,
        salt: config.salt
      });
    }
    // 兼容未加密的旧数据
    return config.apiKey;
  }

  /**
   * 迁移旧配置：对明文 apiKey 进行加密
   * @param {Array} configs - 配置数组
   * @returns {Promise<Array>} 加密后的配置数组
   */
  async migrateConfigs(configs) {
    let needsUpdate = false;
    const migrated = [];

    for (const config of configs) {
      if (this.isEncrypted(config)) {
        // 已加密，直接使用
        migrated.push(config);
      } else if (config.apiKey) {
        // 明文 apiKey，需要加密
        needsUpdate = true;
        const encryptionData = await this.encryptApiKey(config.apiKey);
        migrated.push({
          ...config,
          encryptedKey: encryptionData.encryptedKey,
          iv: encryptionData.iv,
          salt: encryptionData.salt,
          algorithm: encryptionData.algorithm,
          iterations: encryptionData.iterations,
          keyLength: encryptionData.keyLength,
          apiKey: undefined // 移除明文 apiKey
        });
      } else {
        // 无 apiKey 的配置，保持原样
        migrated.push(config);
      }
    }

    return { migrated, needsUpdate };
  }
}

// 导出单例
const cryptoService = new CryptoService();

// 挂载到全局作用域供 Service Worker 和页面使用
if (typeof window !== 'undefined') {
  window.cryptoService = cryptoService;
}
if (typeof global !== 'undefined') {
  global.cryptoService = cryptoService;
}