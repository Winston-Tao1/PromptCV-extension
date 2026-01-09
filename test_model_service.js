/**
 * 简单的测试脚本，验证 modelService.js 是否正确加载和工作
 * 这个脚本可以在浏览器控制台中运行
 */

// 测试 modelService 是否可用
function testModelService() {
    console.log('=== 开始测试 modelService ===');
    
    // 检查 modelService 是否存在
    if (typeof modelService === 'undefined') {
        console.error('❌ modelService 未定义');
        return false;
    }
    console.log('✅ modelService 已加载');
    
    // 测试配置验证
    const testConfig = {
        baseUrl: 'https://api.example.com',
        apiKey: 'test-key-123',
        modelName: 'gpt-3.5-turbo'
    };
    
    const validation = modelService.validateConfig(testConfig);
    console.log('配置验证结果:', validation);
    
    if (!validation.valid) {
        console.error('❌ 配置验证失败:', validation.message);
        return false;
    }
    console.log('✅ 配置验证通过');
    
    // 测试无效配置
    const invalidConfig = {
        baseUrl: '',
        apiKey: 'test-key',
        modelName: 'test-model'
    };
    
    const invalidValidation = modelService.validateConfig(invalidConfig);
    console.log('无效配置验证结果:', invalidValidation);
    
    if (invalidValidation.valid) {
        console.error('❌ 无效配置应该被拒绝');
        return false;
    }
    console.log('✅ 无效配置正确被拒绝');
    
    // 测试支持的供应商列表
    const providers = modelService.getSupportedProviders();
    console.log('支持的供应商:', providers);
    
    if (!providers || providers.length === 0) {
        console.error('❌ 供应商列表为空');
        return false;
    }
    console.log('✅ 供应商列表正常');
    
    console.log('=== 所有基础测试通过 ===');
    return true;
}

// 如果在浏览器环境中，直接运行测试
if (typeof window !== 'undefined' && window.modelService) {
    testModelService();
} else {
    console.log('请在已加载 modelService.js 的浏览器环境中运行此测试');
}
