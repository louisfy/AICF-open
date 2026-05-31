import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';
import { processPdfForVisionModel, isVisionModel, isPdfFile } from './pdfToImageConverter';

const isDebugLoggingEnabled = () => {
  try {
    return Boolean(
      import.meta.env.DEV &&
      typeof window !== 'undefined' &&
      window.localStorage.getItem('aicfDebugLogs') === 'true'
    );
  } catch {
    return false;
  }
};

const debugLog = (...args) => {
  if (isDebugLoggingEnabled()) console.log(...args);
};

const debugWarn = (...args) => {
  if (isDebugLoggingEnabled()) console.warn(...args);
};

const debugError = (...args) => {
  if (isDebugLoggingEnabled()) console.error(...args);
};

// 聊天界面组件
function AIChatInterface() {
  // 聊天模型配置 - 硅基流动支持的模型（修复重复ID问题）
  const AI_MODELS = [
    // DeepSeek 系列
    {
      id: 'deepseek-r1-pro',
      name: 'DeepSeek-R1',
      model: 'Pro/deepseek-ai/DeepSeek-R1',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 130000
    },
    {
      id: 'deepseek-r1-0120-pro',
      name: 'DeepSeek-R1-0120',
      model: 'Pro/deepseek-ai/DeepSeek-R1-0120',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 130000
    },
    {
      id: 'deepseek-v3-pro',
      name: 'DeepSeek-V3',
      model: 'Pro/deepseek-ai/DeepSeek-V3',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 130000
    },
    {
      id: 'deepseek-v2-5',
      name: 'DeepSeek-V2.5',
      model: 'deepseek-ai/DeepSeek-V2.5',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    {
      id: 'deepseek-v3',
      name: 'DeepSeek-V3',
      model: 'deepseek-ai/DeepSeek-V3',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 130000
    },
    {
      id: 'deepseek-r1',
      name: 'DeepSeek-R1 (硅基流动)',
      model: 'deepseek-ai/DeepSeek-R1',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 130000
    },
    {
      id: 'deepseek-r1-distill-qwen-32b',
      name: 'DeepSeek-R1-Distill-Qwen-32B (硅基流动)',
      model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
     },
     {
      id: 'deepseek-r1-distill-qwen-14b',
      name: 'DeepSeek-R1-Distill-Qwen-14B',
      model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    {
      id: 'deepseek-r1-distill-qwen-7b',
      name: 'DeepSeek-R1-Distill-Qwen-7B (硅基流动)',
      model: 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    // Qwen 系列
    {
      id: 'qwen2-5-72b',
      name: 'Qwen2.5-72B-Instruct',
      model: 'Qwen/Qwen2.5-72B-Instruct',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    {
      id: 'qwen2-5-32b',
      name: 'Qwen2.5-32B-Instruct',
      model: 'Qwen/Qwen2.5-32B-Instruct',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    {
      id: 'qwen2-5-14b',
      name: 'Qwen2.5-14B-Instruct',
      model: 'Qwen/Qwen2.5-14B-Instruct',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    {
      id: 'qwen2-5-7b',
      name: 'Qwen2.5-7B-Instruct',
      model: 'Qwen/Qwen2.5-7B-Instruct',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    {
      id: 'qwq-32b-preview',
      name: 'QwQ-32B-Preview (硅基流动)',
      model: 'Qwen/QwQ-32B-Preview',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    // GLM 系列
    {
      id: 'glm-4-9b-chat',
      name: 'GLM-4-9B-Chat',
      model: 'THUDM/glm-4-9b-chat',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 32000
    },
    {
      id: 'glm-4-32b-0414',
      name: 'GLM-4-32B-0414',
      model: 'THUDM/GLM-4-32B-0414',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 32000
    },
    // InternLM 系列
    {
      id: 'internlm2-5-7b-chat',
      name: 'InternLM2.5-7B-Chat',
      model: 'internlm/internlm2_5-7b-chat',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 1000000
    },
    {
      id: 'internlm2-5-20b-chat',
      name: 'InternLM2.5-20B-Chat',
      model: 'internlm/internlm2_5-20b-chat',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 1000000
    },
    // VL 视觉模型系列
    {
      id: 'qwen2-vl-7b',
      name: 'Qwen2-VL-7B-Instruct (视觉模型)',
      model: 'Qwen/Qwen2-VL-7B-Instruct',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    },
    {
       id: 'qwen2-vl-72b',
       name: 'Qwen2-VL-72B-Instruct (视觉模型)',
       model: 'Qwen/Qwen2-VL-72B-Instruct',
       apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
       provider: 'siliconflow',
       maxTokens: 128000
     },
     {
       id: 'qwen25-vl-72b',
       name: 'Qwen2.5-VL-72B-Instruct (视觉模型)',
       model: 'Qwen2.5-VL-72B-Instruct',
       apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
       provider: 'siliconflow',
       maxTokens: 128000
     },
     {
       id: 'qwen25-vl-32b',
       name: 'Qwen2.5-VL-32B-Instruct (视觉模型)',
       model: 'Qwen/Qwen2.5-VL-32B-Instruct',
       apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
       provider: 'siliconflow',
       maxTokens: 128000
     },
    {
      id: 'glm4v-9b',
      name: 'GLM-4V-9B (视觉模型)',
      model: 'THUDM/glm-4v-9b',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 32000
    },
    {
      id: 'internvl2-8b',
      name: 'InternVL2-8B (视觉模型)',
      model: 'OpenGVLab/InternVL2-8B',
      apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
      provider: 'siliconflow',
      maxTokens: 128000
    }
  ];

  // 默认系统提示词
  const DEFAULT_SYSTEM_PROMPT = '你是一个有用的AI助手，能够提供准确、有帮助的回答。';

  // 推理模型检测函数
  const isReasoningModelBySiliconFlow = (modelName) => {
    const reasoningModels = [
      'Pro/deepseek-ai/DeepSeek-R1',
      'Pro/deepseek-ai/DeepSeek-R1-0120',
      'deepseek-ai/DeepSeek-R1',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-32B',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-14B',
      'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B',
      'Qwen/QwQ-32B-Preview'
    ];
    return reasoningModels.includes(modelName);
  };

  // 生成唯一ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  };

  // 自定义 Markdown 渲染组件
  const MarkdownRenderer = ({ content }) => {
    return (
      <div 
        className="markdown-body prose max-w-none"
        style={{
          '--hljs-background': '#f6f8fa',
          '--hljs-color': '#24292e',
          backgroundColor: 'transparent',
          color: '#374151'
        }}
      >
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    );
  };
  // 状态管理
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  // 直接从currentConversation派生messages，确保单一数据源
  const messages = currentConversation?.messages || [];
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState(null);

  // 模型相关状态
  const [availableModels, setAvailableModels] = useState(AI_MODELS);
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showModelSelect, setShowModelSelect] = useState(false);

  // 文件上传状态
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [favoriteModels, setFavoriteModels] = useState([]);

  // 生成控制状态
  const [isGenerating, setIsGenerating] = useState(false);
  const [abortController, setAbortController] = useState(null);

  // 辅助函数：更新消息，确保同时更新currentConversation和conversations
  const updateMessages = useCallback((updater) => {
    if (!currentConversation) return;
    
    setCurrentConversation(prev => {
      if (!prev) return prev;
      const newMessages = typeof updater === 'function' ? updater(prev.messages || []) : updater;
      const updatedConversation = {
        ...prev,
        messages: newMessages,
        lastUpdated: new Date().toISOString()
      };
      
      // 同时更新conversations列表
      setConversations(prevConversations => 
        prevConversations.map(conv => 
          conv.id === prev.id ? updatedConversation : conv
        )
      );
      
      return updatedConversation;
    });
  }, [currentConversation?.id]);

  // 设置状态
  const [settings, setSettings] = useState({
    apiKey: '',
    temperature: 0.7,
    topP: 0.9,
    topK: 50,
    maxContextSize: 4,
    maxTokens: 1000,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    saveHistory: true,
    autoSave: true,
    selectedModel: AI_MODELS[0], // Default model
    userAvatar: null,
    assistantName: 'AI 助手', // 新增：可编辑的AI助手名字
    // 网络搜索设置
    tavilyApiKey: '',
    enableWebSearch: false,
    autoWebSearch: false, // 新增：自动网络搜索选项
    webSearchCount: 10 // 新增：网络搜索结果数量，默认10条
  });

  // 网络搜索相关状态
  const [activeSettingsTab, setActiveSettingsTab] = useState('general'); // 'general' 或 'search'
  const [isWebSearching, setIsWebSearching] = useState(false);

  // 新增：AI助手名字编辑状态
  const [isEditingAssistantName, setIsEditingAssistantName] = useState(false);

  // 批量选择和删除功能状态
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState(new Set());
  const [showBatchDeleteConfirm, setShowBatchDeleteConfirm] = useState(false);

  // 系统角色设定编辑状态
  const [showSystemPromptEditor, setShowSystemPromptEditor] = useState(false);
  const [tempSystemPrompt, setTempSystemPrompt] = useState('');

  // AI翻译相关状态
  const [showTranslator, setShowTranslator] = useState(false);
  const [translatorSettings, setTranslatorSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('translatorSettings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // 确保选中的模型在当前可用模型列表中
        const savedModel = parsed.selectedModel;
        const modelExists = AI_MODELS.find(m => m.model === savedModel?.model);
        return {
          selectedModel: modelExists || AI_MODELS[0],
          autoDetect: parsed.autoDetect ?? true,
          sourceLanguage: parsed.sourceLanguage || 'auto',
          targetLanguage: parsed.targetLanguage || 'auto'
        };
      }
    } catch {
      // 如果解析失败，使用默认设置
    }
    return {
      selectedModel: AI_MODELS[0],
      autoDetect: true,
      sourceLanguage: 'auto',
      targetLanguage: 'auto'
    };
  });
  
  // 保存翻译器设置到localStorage
  const saveTranslatorSettings = (newSettings) => {
    try {
      localStorage.setItem('translatorSettings', JSON.stringify(newSettings));
    } catch (error) {
      debugWarn('Failed to save translator settings:', error);
    }
  };
  
  // 更新翻译器设置并保存
   const updateTranslatorSettings = (newSettings) => {
      setTranslatorSettings(newSettings);
      saveTranslatorSettings(newSettings);
    };
  const [translatorModelSearchTerm, setTranslatorModelSearchTerm] = useState('');
  const [showTranslatorModelSelect, setShowTranslatorModelSelect] = useState(false);
  const [translatorSourceText, setTranslatorSourceText] = useState('');
  const [translatorTargetText, setTranslatorTargetText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationHistory, setTranslationHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('translationHistory');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showTranslationHistory, setShowTranslationHistory] = useState(false);
  const [translatorActiveTab, setTranslatorActiveTab] = useState('translate'); // 'translate' or 'history'
  const [showTranslatorSettings, setShowTranslatorSettings] = useState(false);
  const [isStreamingTranslation, setIsStreamingTranslation] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);

  // 引用
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const modelSelectRef = useRef(null);

  // 新增：更新AI助手名字的函数
  const updateAssistantName = (newName) => {
    if (newName.trim()) {
      const updatedSettings = {
        ...settings,
        assistantName: newName.trim()
      };
      setSettings(updatedSettings);
      localStorage.setItem('aiChatSettings', JSON.stringify(updatedSettings));
    }
  };

  // 系统角色设定编辑相关函数
  const openSystemPromptEditor = () => {
    // 使用当前对话的systemPrompt，如果没有则使用全局设置
    const currentPrompt = currentConversation?.systemPrompt || settings.systemPrompt;
    setTempSystemPrompt(currentPrompt);
    setShowSystemPromptEditor(true);
  };

  const closeSystemPromptEditor = () => {
    setShowSystemPromptEditor(false);
    setTempSystemPrompt('');
  };

  const saveSystemPrompt = () => {
    if (currentConversation) {
      // 更新当前对话的systemPrompt
      const updatedConversation = {
        ...currentConversation,
        systemPrompt: tempSystemPrompt
      };
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversation.id ? updatedConversation : conv
      );
      setConversations(updatedConversations);
      setCurrentConversation(updatedConversation);
      if (settings.autoSave) {
        saveConversations(updatedConversations);
      }
    }
    closeSystemPromptEditor();
  };

  // 网络搜索功能
  const performWebSearch = async (query) => {
    if (!settings.tavilyApiKey || !settings.enableWebSearch) {
      throw new Error('网络搜索功能未配置或未启用');
    }

    setIsWebSearching(true);
    debugLog('开始调用 Tavily API...');
    debugLog('查询内容:', query);
    debugLog('API Key 状态:', settings.tavilyApiKey ? '已配置' : '未配置');
    
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.tavilyApiKey}`
        },
        body: JSON.stringify({
          query: query,
          search_depth: 'basic',
          include_answer: true,
          include_raw_content: false,
          max_results: settings.webSearchCount || 10
        })
      });
      
      debugLog('API 响应状态:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        debugError('API 请求失败:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`搜索请求失败: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      debugLog('Tavily API 原始响应:', data);
      debugLog('搜索结果数量:', data.results ? data.results.length : '无results字段');
      return data;
    } catch (error) {
      debugError('网络搜索错误详情:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      throw error;
    } finally {
      setIsWebSearching(false);
    }
  };


  // 处理网络搜索按钮点击
  const handleWebSearchClick = async () => {
    debugLog('网络搜索按钮被点击');
    debugLog('当前设置状态:', {
      enableWebSearch: settings.enableWebSearch,
      tavilyApiKey: settings.tavilyApiKey ? '已配置' : '未配置',
      inputMessage: inputMessage.trim()
    });
    
    if (!inputMessage.trim()) {
      alert('请先输入搜索内容');
      return;
    }

    if (!settings.tavilyApiKey) {
      alert('请先在设置中配置 Tavily API Key');
      setShowSettings(true);
      setActiveSettingsTab('search');
      return;
    }

    if (!settings.enableWebSearch) {
      alert('请先在设置中启用网络搜索功能');
      setShowSettings(true);
      setActiveSettingsTab('search');
      return;
    }

    const searchStatusMsgId = `search-status-${generateId()}`;
    try {
      const initialSearchStatusMsg = {
        id: searchStatusMsgId,
        role: 'status', // Special role for styling search status
        content: '正在通过网络搜索相关信息...',
        timestamp: Date.now(),
      };
      updateMessages(prev => [...prev, initialSearchStatusMsg]);

      const searchResultsData = await performWebSearch(inputMessage.trim());
      const searchResults = searchResultsData.results || searchResultsData.data || searchResultsData; // Handle different possible structures

      if (!searchResults || searchResults.length === 0) {
        updateMessages(prev => prev.map(m => 
          m.id === searchStatusMsgId 
            ? { ...m, content: '未能找到相关的网络信息。请尝试其他查询。', isError: true, timestamp: Date.now() } 
            : m
        ));
        setIsWebSearching(false); // Stop web searching UI indicators
        return; 
      }

      updateMessages(prev => prev.map(m => 
        m.id === searchStatusMsgId 
          ? { ...m, content: `已获取 ${searchResults.length} 条相关信息，正在整理并请求 AI 分析...` } 
          : m
      ));
      
      // 创建包含搜索结果的消息
      const searchMessage = {
        id: generateId(),
        role: 'assistant', // 网络搜索结果应该显示在左侧（AI侧）
        content: inputMessage.trim(),
        timestamp: new Date().toISOString(),
        isWebSearch: true,
        searchResults: searchResults // Store the actual results array here
      };

      // 添加用户搜索消息 (original message with search results)
      const updatedMessages = [...messages.filter(m => m.id !== searchStatusMsgId), searchMessage, messages.find(m=>m.id === searchStatusMsgId)].filter(Boolean);

      // 构建包含搜索结果的提示词
      debugLog('搜索结果数据:', searchResults);
      let searchContext = '';
      
      // 检查不同可能的数据结构
      const results = searchResults.results || searchResults.data || searchResults;
      
      if (results && Array.isArray(results) && results.length > 0) {
        searchContext = '\n\n基于以下网络搜索结果回答问题：\n';
        results.forEach((result, index) => {
          searchContext += `${index + 1}. ${result.title || result.name || '无标题'}\n${result.content || result.snippet || result.description || '无内容'}\n来源: ${result.url || result.link || '无链接'}\n\n`;
        });
      } else {
        // 如果没有搜索结果，仍然告诉AI这是一个搜索请求
        searchContext = '\n\n请注意：这是一个网络搜索请求，但未能获取到有效的搜索结果。请基于你的知识回答问题，并说明这是基于已有知识而非实时搜索结果。';
      }

      let enhancedPrompt = inputMessage.trim() + searchContext;
      
      // 问题三修复：只对官方文档明确支持思考链的模型添加推理过程要求（搜索增强）
      // 使用ApiService中的推理模型判断函数
      const isReasoningModel = isReasoningModelBySiliconFlow(settings.selectedModel.model);
      
      if (isReasoningModel) {
        enhancedPrompt += '\n\n请在回答时展示完整的推理过程和思考链。';
        debugLog('为推理模型添加了推理过程要求');
      }
      
      // 清空输入框
      setInputMessage('');
      
      // 更新消息列表
      updateMessages(() => updatedMessages);
      setIsLoading(true);
      setIsGenerating(true);

      const controller = new AbortController();
      setAbortController(controller);

      try {
        const messagesToSend = [];
        // 添加对话历史
        const historyMessages = updatedMessages.slice(-settings.maxContextSize * 2);
        messagesToSend.push(...historyMessages);

        const aiMessageId = generateId();
        const aiMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          reasoning_content: '',
          thinkingTime: null,
          thinkingStartTime: Date.now(),
          timestamp: new Date().toISOString(),
          model: settings.selectedModel.name
        };

        updateMessages(prevMessages => [...prevMessages, aiMessage]);

        const onStreamUpdate = (chunk, fullContent, reasoningContent) => {
          debugLog('🔄 onStreamUpdate 被调用 (网络搜索):', { 
            chunk: chunk?.substring(0, 100) + (chunk?.length > 100 ? '...' : ''), 
            fullContentLength: fullContent?.length || 0,
            reasoningContentLength: reasoningContent?.length || 0,
            reasoningContent: reasoningContent?.substring(0, 200) + (reasoningContent?.length > 200 ? '...' : '') || 'empty'
          }); // 调试日志
          
          updateMessages(prevMsgs =>
            prevMsgs.map(msg =>
              msg.id === aiMessageId
                ? { 
                    ...msg, 
                    content: fullContent,
                    reasoning_content: reasoningContent
                  }
                : msg
            )
          );
          
          // 如果有推理内容，自动展开显示
          // 推理内容始终显示，无需展开逻辑
          if (reasoningContent && reasoningContent.trim()) {
            debugLog('推理内容已更新 (网络搜索)，消息ID:', aiMessageId);
          }
        };

        // 创建一个包含增强提示的临时消息用于API调用
        const tempUserMessage = {
          id: generateId(),
          role: 'user',
          content: enhancedPrompt,
          timestamp: new Date().toISOString(),
          isWebSearch: false, // 这是发送给API的消息，不需要显示搜索结果
          searchResults: searchResults
        };
        
        debugLog('增强提示词内容:', enhancedPrompt);
        debugLog('发送给AI的消息长度:', enhancedPrompt.length);
        
        const messagesForAPI = [...messagesToSend.slice(0, -1), tempUserMessage];
        debugLog('发送给AI的完整消息列表:', messagesForAPI);
        
        // Pass the updated messages including the user's search query message and the status message
        // The AI API call will use messagesForAPI which is built from a slice of updatedMessages
        await callAIAPI(messagesForAPI, settings, [], onStreamUpdate, controller.signal);
      
        // 计算推理用时并更新消息
        updateMessages(prev => prev.map(msg => {
          if (msg.id === aiMessageId && msg.thinkingStartTime && !msg.thinkingTime) {
            return {
              ...msg,
              thinkingTime: ((Date.now() - msg.thinkingStartTime) / 1000).toFixed(1),
              isThinkingComplete: true
            };
          }
          return msg;
        }));
      
        // If AI call was successful and completed, remove the search status message.
        updateMessages(prev => prev.filter(m => m.id !== searchStatusMsgId));

      } catch (error) {
        if (error.name !== 'AbortError') {
          debugError('AI API调用失败:', error);
          const aiErrorMsg = `抱歉，AI 处理您的请求时出现错误：${error.message}`;
          updateMessages(prev => prev.map(m => 
            m.id === searchStatusMsgId 
              ? { ...m, content: aiErrorMsg, isError: true, timestamp: Date.now() } 
              : m
          ));
           // If the status message wasn't there for some reason, add a new error message
          if (!messages.some(m => m.id === searchStatusMsgId)) {
            updateMessages(prevMessages => prevMessages.map(msg => msg.id === aiMessageId ? {...msg, content: aiErrorMsg, isError: true } : msg ));
          }
        }
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
        setAbortController(null);
        // The status message (especially if it's an error) should persist.
        // If it was a success, it's already removed.
      }
      
    } catch (error) { // This catch is for performWebSearch or initial setup errors
      debugError("Error during web search setup or execution:", error);
      const searchErrorMsg = `网络搜索失败: ${error.message}`;
      updateMessages(prev => prev.map(m => 
        m.id === searchStatusMsgId 
          ? { ...m, content: searchErrorMsg, isError: true, timestamp: Date.now() } 
          : m
      ));
      // If the status message wasn't there, add a new error message
      if (!messages.some(m => m.id === searchStatusMsgId)) {
         updateMessages(prev => [...prev, { id: generateId(), role: 'assistant', content: searchErrorMsg, timestamp: Date.now(), isError: true }]);
      }
      setIsWebSearching(false); // Ensure this is reset on search error
      setIsLoading(false);
    }
  };

  // 保存对话历史到本地存储
  const saveConversations = (conversationsToSave) => {
    if (settings.saveHistory) {
      localStorage.setItem('aiConversations', JSON.stringify(conversationsToSave));
    }
  };

  // 自动保存当前对话
  const autoSaveCurrentConversation = () => {
    debugLog('autoSaveCurrentConversation called', {
      autoSave: settings.autoSave,
      hasCurrentConversation: !!currentConversation,
      messagesLength: messages.length
    });
    
    if (settings.autoSave && currentConversation && messages.length > 0) {
      debugLog('Performing auto save...');
      const updatedConversation = {
        ...currentConversation,
        messages: messages,
        lastUpdated: new Date().toISOString()
      };
      const updatedConversations = conversations.map(conv =>
        conv.id === currentConversation.id ? updatedConversation : conv
      );
      setConversations(updatedConversations);
      saveConversations(updatedConversations);
      debugLog('Auto save completed');
    }
  };

  // 开始新对话
  const startNewConversation = () => {
    const newConversation = {
      id: generateId(),
      name: `对话 ${conversations.length + 1}`,
      messages: [],
      lastUpdated: new Date().toISOString(),
      systemPrompt: settings.systemPrompt // 使用当前全局设置作为新对话的默认值
    };
    const updatedConversations = [...conversations, newConversation];
    setConversations(updatedConversations);
    setCurrentConversation(newConversation);
    if (settings.autoSave) {
      saveConversations(updatedConversations);
    }
  };

  // 删除对话
  const deleteConversation = (conversationId) => {
    // TODO: Replace window.confirm with a custom modal for better UX and compatibility.
    if (window.confirm(`确定要删除对话 "${conversations.find(c => c.id === conversationId)?.name || ''}" 吗？`)) {
      const updatedConversations = conversations.filter(conv => conv.id !== conversationId);
      setConversations(updatedConversations);
      if (currentConversation && currentConversation.id === conversationId) {
        if (updatedConversations.length > 0) {
          setCurrentConversation(updatedConversations[0]);
        } else {
          startNewConversation();
        }
      }
      if (settings.autoSave || settings.saveHistory) { // Save if autoSave or general history saving is on
        saveConversations(updatedConversations);
      }
    }
  };

  // 批量删除对话
  const batchDeleteConversations = () => {
    const selectedIds = Array.from(selectedConversations);
    debugLog('batchDeleteConversations - selectedIds:', selectedIds);
    debugLog('batchDeleteConversations - conversations:', conversations);
    debugLog('batchDeleteConversations - conversations.map(conv => conv.id):', conversations.map(conv => conv.id));
    const updatedConversations = conversations.filter(conv => !selectedIds.includes(conv.id));
    debugLog('batchDeleteConversations - updatedConversations:', updatedConversations);
    setConversations(updatedConversations);
    
    // 如果当前对话被删除，切换到其他对话或创建新对话
    if (currentConversation && selectedIds.includes(currentConversation.id)) {
      if (updatedConversations.length > 0) {
        setCurrentConversation(updatedConversations[0]);
      } else {
        startNewConversation();
      }
    }
    
    // 直接保存到localStorage，确保删除操作生效
    localStorage.setItem('aiConversations', JSON.stringify(updatedConversations));
    
    // 重置选择状态
    setSelectedConversations(new Set());
    setIsEditMode(false);
    setShowBatchDeleteConfirm(false);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    debugLog('toggleSelectAll - conversations:', conversations);
    debugLog('toggleSelectAll - conversations.map(conv => conv.id):', conversations.map(conv => conv.id));
    if (selectedConversations.size === conversations.length) {
      setSelectedConversations(new Set());
    } else {
      const allIds = conversations.map(conv => conv.id);
      debugLog('toggleSelectAll - setting selectedConversations to:', allIds);
      setSelectedConversations(new Set(allIds));
    }
  };

  // 切换单个对话的选择状态
  const toggleConversationSelection = (conversationId) => {
    const newSelected = new Set(selectedConversations);
    if (newSelected.has(conversationId)) {
      newSelected.delete(conversationId);
    } else {
      newSelected.add(conversationId);
    }
    setSelectedConversations(newSelected);
  };

  // 退出编辑模式
  const exitEditMode = () => {
    setIsEditMode(false);
    setSelectedConversations(new Set());
  };

  // 重命名对话
  const renameConversation = (conversationId, newName) => {
    const updatedConversations = conversations.map(conv =>
      conv.id === conversationId ? { ...conv, name: newName } : conv
    );
    setConversations(updatedConversations);
    if (currentConversation && currentConversation.id === conversationId) {
      setCurrentConversation(prev => ({ ...prev, name: newName }));
    }
    if (settings.autoSave) {
      saveConversations(updatedConversations);
    }
  };


  // 获取硅基流动模型列表
  const fetchSiliconFlowModels = async () => {
    if (!settings.apiKey || settings.apiKey.trim() === '') {
      // If API key is removed, reset to default models
      setAvailableModels(AI_MODELS);
      return;
    }

    setIsLoadingModels(true);
    try {
      const response = await fetch('https://api.siliconflow.cn/v1/models?sub_type=chat', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedApiModels = data.data.map(model => ({
          id: 'silicon-' + model.id.replace(/[^a-zA-Z0-9]/g, '-'), // 生成唯一ID
          name: model.id.split('/').pop() || model.id,
          model: model.id,
          apiEndpoint: 'https://api.siliconflow.cn/v1/chat/completions',
          provider: 'siliconflow'
        }));
        // Combine with local AI_MODELS, ensuring no duplicates based on model.model
        const combinedModels = [...AI_MODELS];
        fetchedApiModels.forEach(apiModel => {
          if (!combinedModels.some(localModel => localModel.model === apiModel.model)) {
            combinedModels.push(apiModel);
          }
        });
        setAvailableModels(combinedModels);
      } else {
        debugError('获取模型列表API响应错误:', response.status, await response.text());
        setAvailableModels(AI_MODELS); // Fallback to local models on API error
      }
    } catch (error) {
      debugError('获取模型列表失败:', error);
      setAvailableModels(AI_MODELS); // Fallback to local models on fetch error
    } finally {
      setIsLoadingModels(false);
    }
  };

  // 将文件转换为base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // 上传文件到硅基流动API
  const uploadFileToSiliconFlow = async (file) => {
    debugLog('开始上传文件到硅基流动API:', { name: file.name, type: file.type, size: file.size });
    debugLog('当前API密钥状态:', { hasApiKey: !!settings.apiKey, keyLength: settings.apiKey?.length || 0 });
    
    if (!settings.apiKey || settings.apiKey.trim() === '') {
      const error = new Error('请先在设置中配置硅基流动API密钥');
      debugError('API密钥未设置:', error);
      throw error;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'assistants'); // 硅基流动API要求的purpose参数
      
      debugLog('准备发送请求到硅基流动API...');

      const response = await fetch('https://api.siliconflow.cn/v1/files', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`
        },
        body: formData
      });
      
      debugLog('收到硅基流动API响应:', { status: response.status, statusText: response.statusText });

      if (!response.ok) {
        const errorText = await response.text();
        debugError('硅基流动API返回错误:', { status: response.status, statusText: response.statusText, errorText });
        throw new Error(`文件上传失败: ${response.status} ${response.statusText}\n${errorText}`);
      }

      const responseData = await response.json();
      debugLog('文件上传成功:', responseData);
      return responseData; // 返回文件信息，包含file_id等
    } catch (error) {
      debugError('文件上传过程中发生错误:', error);
      throw error;
    }
  };

  // 调用硅基流动AI API
  const callAIAPI = async (messagesToProcess, apiSettings, filesForApi = [], onStreamUpdate = null, abortSignal = null) => {
    // 如果没有API密钥，使用模拟API调用
    if (!apiSettings.apiKey || apiSettings.apiKey.trim() === '') {
      return mockAPICall(messagesToProcess, apiSettings);
    }

    try {
      // 构建系统消息 - 使用当前对话的systemPrompt，如果没有则使用全局设置
      const conversationSystemPrompt = currentConversation?.systemPrompt || apiSettings.systemPrompt;
      const systemMessage = {
        role: 'system',
        content: conversationSystemPrompt
      };

      // 准备消息列表，确保系统消息在最前面
      // Filter out any existing system messages from messagesToProcess as we are adding our own
      const userAndAssistantMessages = messagesToProcess.filter(msg => msg.role !== 'system');
      const apiMessages = [systemMessage, ...userAndAssistantMessages];

      // 处理包含文件的消息
      const processedMessages = await Promise.all(apiMessages.map(async (msg) => {
        if (msg.files && msg.files.length > 0) {
          const contentParts = [];

          // 添加文本内容
          if (msg.content && msg.content.trim()) {
            contentParts.push({
              type: 'text',
              text: msg.content
            });
          }

          // 添加文件内容
          for (const fileInfo of msg.files) {
            const fileObj = filesForApi.find(f => f.id === fileInfo.id); // filesForApi contains full file objects

            if (fileObj) {
              // 处理PDF转换的图片
              if (fileObj.pdfImages && fileObj.pdfImages.length > 0) {
                // PDF已转换为图片，添加所有图片
                for (const pdfImage of fileObj.pdfImages) {
                  contentParts.push({
                    type: 'image_url',
                    image_url: {
                      url: `data:${pdfImage.type};base64,${pdfImage.base64}`
                    }
                  });
                }
              } else if (fileObj.fileId) { // siliconflow file_id
                // 注意：硅基流动API不支持file类型，只支持text和image_url
                // 对于非图片文件，我们只能发送文本内容，无法直接引用上传的文件
                debugWarn('硅基流动API不支持file类型引用，跳过非图片文件:', fileObj.name);
                // 不添加file类型的content，避免API错误
              } else if (fileInfo.type && fileInfo.type.startsWith('image/')) {
                if (fileObj.file) {
                  // 原始文件存在，转换为base64
                  const base64 = await fileToBase64(fileObj.file);
                  contentParts.push({
                    type: 'image_url',
                    image_url: {
                      url: `data:${fileInfo.type};base64,${base64}`
                    }
                  });
                } else {
                  // 重新生成时原始文件不存在，跳过图片文件
                  debugWarn('重新生成时无法处理图片文件，原始文件已丢失:', fileObj.name);
                }
              }
              // TODO: Handle other file types if necessary, e.g. text files might be inlined or require specific format
            }
          }
          // SiliconFlow might expect a flat list of content parts or a specific structure
          // For text + image, it's often an array of objects like:
          // content: [ {type: "text", text: "describe this"}, {type: "image_url", image_url: {url: "data:..."}}]
          // If only file_id is used, the format might be different. Assuming 'contentParts' is the way for now.
          return {
            role: msg.role,
            content: contentParts.length > 0 ? contentParts : msg.content // Fallback to original content if no parts processed
          };
        } else {
          return {
            role: msg.role,
            content: msg.content
          };
        }
      }));

      const body = {
        model: apiSettings.selectedModel.model,
        messages: processedMessages,
        temperature: apiSettings.temperature,
        top_p: apiSettings.topP,
        max_tokens: apiSettings.maxTokens,
        stream: true
      };

      // 判断是否为需要开启思考模式的硅基模型
      const isReasoningSiliconModel = (
        apiSettings.selectedModel.provider === 'siliconflow' && // 确保是硅基模型
        isReasoningModelBySiliconFlow(apiSettings.selectedModel.model)
      );

      if (isReasoningSiliconModel) {
        body.enable_thinking = true;
        body.thinking_budget = 4096; // 可选，根据需要调整
        debugLog('为硅基模型启用推理模式:', apiSettings.selectedModel.model);
      }

      const response = await fetch(apiSettings.selectedModel.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiSettings.apiKey}`
        },
        body: JSON.stringify(body),
        signal: abortSignal
      });

      if (!response.ok) {
        let errorMessage = `硅基流动API请求失败: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          // 尝试解析JSON格式的错误信息
          const errorData = JSON.parse(errorText);
          if (errorData.message) {
            errorMessage += ` - ${errorData.message}`;
          } else {
            errorMessage += `\n${errorText}`;
          }
        } catch (parseError) {
          // 如果不是JSON格式，直接添加原始错误文本
          const errorText = await response.text();
          errorMessage += `\n${errorText}`;
        }
        throw new Error(errorMessage);
      }

      // 检查是否为流式响应
      if (body.stream) {
        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';
        let fullThinking = '';
        let isInThinking = false;

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') {
                  // 流式响应结束，确保最终状态正确传递
                  if (typeof onStreamUpdate === 'function') {
                    onStreamUpdate('', fullContent, fullThinking);
                  }
                  return fullContent;
                }

                try {
                  const parsed = JSON.parse(data);
                  if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta) {
                    const delta = parsed.choices[0].delta;
                    
                    // 处理推理内容 - 支持多种字段名
                    const reasoning = delta.reasoning_content || delta.reasoning || delta.thinking;
                    if (reasoning) {
                      fullThinking += reasoning;
                      if (typeof onStreamUpdate === 'function') {
                        onStreamUpdate('', fullContent, fullThinking);
                      }
                    }
                    
                    // 处理正常内容
                    if (delta.content) {
                      const content = delta.content;
                      
                      // 检测思考标签
                      if (content.includes('<think>')) {
                        isInThinking = true;
                        const parts = content.split('<think>');
                        if (parts[0]) {
                          fullContent += parts[0];
                        }
                        if (parts[1]) {
                          fullThinking += parts[1];
                        }
                      } else if (content.includes('</think>')) {
                        isInThinking = false;
                        const parts = content.split('</think>');
                        if (parts[0]) {
                          fullThinking += parts[0];
                        }
                        if (parts[1]) {
                          fullContent += parts[1];
                        }
                      } else if (isInThinking) {
                        fullThinking += content;
                      } else {
                        fullContent += content;
                      }

                      if (typeof onStreamUpdate === 'function') {
                        onStreamUpdate(content, fullContent, fullThinking);
                      }
                    }
                  }
                } catch (e) {
                  // debugWarn('忽略解析错误的数据块:', data, e); // Optional: log parsing errors
                  continue;
                }
              }
            }
          }
          return fullContent;
        } finally {
          reader.releaseLock();
        }
      } else {
        // 处理非流式响应
        const responseData = await response.json();
        
        if (responseData.choices && responseData.choices.length > 0) {
          const choice = responseData.choices[0];
          const finalContent = choice.message.content || '';
          
          // 提取推理内容 - 支持多种字段名
          const finalReasoning = choice.message.reasoning_content     // 主字段
                                || choice.message.reasoning            // 兼容
                                || choice.message.thinking 
                                || '';
          
          debugLog('非流式响应 - 推理内容:', finalReasoning);
          
          // 通过 onStreamUpdate 传递最终结果
          if (typeof onStreamUpdate === 'function') {
            onStreamUpdate('', finalContent, finalReasoning);
          }
          
          return finalContent;
        }
        
        return '';
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        debugLog('API请求已取消');
        return ''; // Or throw a specific error to be handled upstream
      }
      debugError('调用硅基流动API失败:', error);
      throw error;
    }
  };

  // 模拟API调用
  const mockAPICall = (mockMessages, mockSettings) => {
    return new Promise(resolve => {
      setTimeout(() => {
        const lastUserMessage = mockMessages.filter(m => m.role === 'user').pop();
        let responseText = `这是对"${lastUserMessage?.content || ''}"的模拟回复。`;
        if (mockSettings.selectedModel.name) {
          responseText += ` (模型: ${mockSettings.selectedModel.name})`;
        }
        resolve(responseText);
      }, 1000);
    });
  };


  // 处理文件上传
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    debugLog('选择的文件:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'text/plain', 'application/pdf',
      'application/msword', // .doc文件
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx文件
    ]; // Consider matching with 'accept' attribute or API capabilities
    const validFiles = files.filter(file => {
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB限制
      debugLog(`文件验证 ${file.name}:`, { type: file.type, isValidType, size: file.size, isValidSize });
      return isValidType && isValidSize;
    });
    
    debugLog('通过验证的文件:', validFiles.length, '个');
    
    if (validFiles.length === 0) {
      debugWarn('没有文件通过验证');
      return;
    }

    // 设置全局加载状态，防止用户在处理过程中进行其他操作
    setIsLoading(true);
    
    try {
      for (const file of validFiles) {
        const fileObj = {
          id: generateId(),
          file,
          name: file.name,
          type: file.type,
          size: file.size,
          uploading: true,
          uploadError: null,
          fileId: null,
          pdfImages: null, // 用于存储PDF转换的图片
          processingStatus: '准备处理...' // 新增：处理状态
        };

        setUploadedFiles(prev => [...prev, fileObj]);

        debugLog(`=== 开始处理文件 ${file.name} ===`);
        debugLog('文件信息:', { name: file.name, type: file.type, size: file.size });
        debugLog('当前模型详细信息:', {
          selectedModel: settings.selectedModel,
          modelName: settings.selectedModel?.name,
          modelPath: settings.selectedModel?.model,
          modelType: settings.selectedModel?.type
        });
        debugLog('当前设置:', { hasApiKey: !!settings.apiKey, keyLength: settings.apiKey?.length || 0 });
        
        // 提前检查模型是否支持视觉
        const isVision = isVisionModel(settings.selectedModel);
        debugLog('模型视觉支持检查结果:', isVision);
        
        try {
          // 检查是否为PDF文件且当前模型支持视觉输入
          const isPdf = isPdfFile(file);
          const isVision = isVisionModel(settings.selectedModel);
          debugLog('文件类型检查:', { isPdf, isVision });
          
          if (isPdf && isVision) {
            debugLog('检测到PDF文件且当前模型支持视觉输入，开始转换为图片...');
            
            // 更新处理状态
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileObj.id
                ? { ...f, processingStatus: 'PDF转换中，请稍候...' }
                : f
            ));
            
            try {
              // 设置超时时间，根据文件大小调整
              const timeout = file.size > 10 * 1024 * 1024 ? 60000 : 30000; // 大文件60秒，小文件30秒
              
              // 处理PDF转图片（带超时保护）
              const pdfResult = await processPdfForVisionModel(file, settings.selectedModel, timeout);
              debugLog('PDF转换结果:', pdfResult);
              
              if (pdfResult && pdfResult.success) {
                // PDF转换成功，更新文件对象
                setUploadedFiles(prev => prev.map(f =>
                  f.id === fileObj.id
                    ? { 
                        ...f, 
                        uploading: false, 
                        pdfImages: pdfResult.images,
                        uploadError: null,
                        processingStatus: `PDF转换完成，生成${pdfResult.images.length}页图片`
                      }
                    : f
                ));
                debugLog(`PDF转换成功，生成了 ${pdfResult.images.length} 张图片`);
              } else {
                // PDF转换失败，显示错误
                const errorMsg = pdfResult?.error || 'PDF转换失败，未知错误';
                debugError('PDF转换失败:', errorMsg);
                debugError('完整的PDF转换结果:', pdfResult);
                
                // 显示用户友好的错误信息
                let userErrorMsg = errorMsg;
                if (errorMsg.includes('超时')) {
                  userErrorMsg = 'PDF处理超时，文件可能过大或过于复杂，请尝试较小的PDF文件';
                } else if (errorMsg.includes('worker')) {
                  userErrorMsg = 'PDF处理器加载失败，请刷新页面后重试';
                } else if (errorMsg.includes('不支持视觉输入')) {
                  userErrorMsg = '当前模型不支持PDF文件，请选择支持视觉的模型（如GPT-4V、Claude 3等）';
                }
                
                setUploadedFiles(prev => prev.map(f =>
                  f.id === fileObj.id
                    ? { 
                        ...f, 
                        uploading: false, 
                        uploadError: `PDF处理失败: ${userErrorMsg}`,
                        processingStatus: 'PDF处理失败'
                      }
                    : f
                ));
                
                // 显示错误提示
                debugWarn(`PDF上传失败: ${userErrorMsg}`);
              }
            } catch (pdfError) {
              debugError('PDF转换过程中发生异常:', pdfError);
              
              let errorMessage = pdfError.message;
              if (errorMessage.includes('超时')) {
                errorMessage = 'PDF处理超时，请尝试较小的文件或检查网络连接';
              }
              
              setUploadedFiles(prev => prev.map(f =>
                f.id === fileObj.id
                  ? { 
                      ...f, 
                      uploading: false, 
                      uploadError: `PDF转换异常: ${errorMessage}`,
                      processingStatus: 'PDF处理异常'
                    }
                  : f
              ));
            }
          } else {
            // 非PDF文件或模型不支持视觉输入，按原流程上传
            debugLog('非PDF文件或模型不支持视觉输入，使用常规上传流程');
            
            // 更新处理状态
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileObj.id
                ? { ...f, processingStatus: '文件上传中...' }
                : f
            ));
            
            // 检查API密钥
            if (!settings.apiKey || settings.apiKey.trim() === '') {
              debugError('API密钥未设置，无法上传文件');
              setUploadedFiles(prev => prev.map(f =>
                f.id === fileObj.id
                  ? { 
                      ...f, 
                      uploading: false, 
                      uploadError: '请先在设置中配置硅基流动API密钥',
                      processingStatus: '上传失败：缺少API密钥'
                    }
                  : f
              ));
              continue;
            }
            
            try {
              const uploadResult = await uploadFileToSiliconFlow(file);
              debugLog('常规文件上传结果:', uploadResult);
              setUploadedFiles(prev => prev.map(f =>
                f.id === fileObj.id
                  ? { 
                      ...f, 
                      uploading: false, 
                      fileId: uploadResult.id,
                      processingStatus: '文件上传完成'
                    }
                  : f
              ));
            } catch (uploadError) {
              debugError('常规文件上传失败:', uploadError);
              let errorMessage = uploadError.message;
              if (errorMessage.includes('API密钥')) {
                errorMessage = '请先在设置中配置硅基流动API密钥';
              }
              setUploadedFiles(prev => prev.map(f =>
                f.id === fileObj.id
                  ? { 
                      ...f, 
                      uploading: false, 
                      uploadError: `文件上传失败: ${errorMessage}`,
                      processingStatus: '文件上传失败'
                    }
                  : f
              ));
            }
          }
        } catch (error) {
          debugError('文件处理过程中发生未知错误:', error);
          setUploadedFiles(prev => prev.map(f =>
            f.id === fileObj.id
              ? { 
                  ...f, 
                  uploading: false, 
                  uploadError: `处理失败: ${error.message || '未知错误'}`,
                  processingStatus: '处理失败'
                }
              : f
          ));
        }
        
        // 在文件之间添加小延迟，避免阻塞UI
        if (validFiles.indexOf(file) < validFiles.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    } catch (error) {
      debugError('文件上传过程中发生全局错误:', error);
      
      // 更新所有正在上传的文件状态为失败
      setUploadedFiles(prev => prev.map(f => 
        f.uploading ? {
          ...f,
          uploading: false,
          uploadError: `系统错误: ${error.message || '未知错误'}`,
          processingStatus: '系统错误'
        } : f
      ));
      
      // 显示用户友好的错误提示
      const errorMsg = error.message || '未知错误';
      debugWarn(`文件上传失败: ${errorMsg}`);
      
      // 可选：显示toast提示而不是alert
      // alert(`文件上传过程中发生错误: ${errorMsg}`);
    } finally {
      // 移除全局加载状态
      setIsLoading(false);
      
      // 清空文件输入
      if (event && event.target) {
        event.target.value = '';
      }
    }
  };

  // 移除上传的文件
  const removeUploadedFile = (fileIdToRemove) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileIdToRemove));
  };

  // 收藏/取消收藏模型
  const toggleFavoriteModel = (modelIdentifier) => {
    setFavoriteModels(prev => {
      const newFavorites = prev.includes(modelIdentifier)
        ? prev.filter(id => id !== modelIdentifier)
        : [...prev, modelIdentifier];
      localStorage.setItem('favoriteModels', JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  // 处理头像更换
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newSettings = { ...settings, userAvatar: e.target.result };
        setSettings(newSettings);
        localStorage.setItem('aiChatSettings', JSON.stringify(newSettings));
      };
      reader.readAsDataURL(file);
    }
  };

  // 处理拖拽上传
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    debugLog('拖拽的文件:', files.map(f => ({ name: f.name, type: f.type, size: f.size })));
    
    const validTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'text/plain', 'application/pdf',
      'application/msword', // .doc文件
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx文件
    ];
    const validFiles = files.filter(file => {
      const isValidType = validTypes.includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024;
      debugLog(`拖拽文件验证 ${file.name}:`, { type: file.type, isValidType, size: file.size, isValidSize });
      return isValidType && isValidSize;
    });
    
    debugLog('拖拽通过验证的文件:', validFiles.length, '个');
    
    if (validFiles.length === 0) {
      debugWarn('没有拖拽文件通过验证');
      return;
    }

    for (const file of validFiles) {
      const fileObj = {
        id: generateId(),
        file,
        name: file.name,
        type: file.type,
        size: file.size,
        uploading: true,
        uploadError: null,
        fileId: null,
        pdfImages: null // 用于存储PDF转换的图片
      };
      setUploadedFiles(prev => [...prev, fileObj]);
      debugLog(`=== 开始处理文件 ${file.name} ===`);
      debugLog('文件信息:', { name: file.name, type: file.type, size: file.size });
      debugLog('当前模型详细信息:', {
        selectedModel: settings.selectedModel,
        modelName: settings.selectedModel?.name,
        modelPath: settings.selectedModel?.model,
        modelType: settings.selectedModel?.type
      });
      debugLog('当前设置:', { hasApiKey: !!settings.apiKey, keyLength: settings.apiKey?.length || 0 });
      
      // 提前检查模型是否支持视觉
      const isVision = isVisionModel(settings.selectedModel);
      debugLog('模型视觉支持检查结果:', isVision);
      
      try {
        
        // 检查是否为PDF文件且当前模型支持视觉输入
        const isPdf = isPdfFile(file);
        const isVision = isVisionModel(settings.selectedModel);
        debugLog('文件类型检查:', { isPdf, isVision });
        
        if (isPdf && isVision) {
          debugLog('检测到PDF文件且当前模型支持视觉输入，开始转换为图片...');
          
          try {
            // 处理PDF转图片
            const pdfResult = await processPdfForVisionModel(file, settings.selectedModel);
            debugLog('PDF转换结果:', pdfResult);
            
            if (pdfResult && pdfResult.success) {
              // PDF转换成功，更新文件对象
              setUploadedFiles(prev => prev.map(f =>
                f.id === fileObj.id
                  ? { 
                      ...f, 
                      uploading: false, 
                      pdfImages: pdfResult.images,
                      uploadError: null
                    }
                  : f
              ));
              debugLog(`PDF转换成功，生成了 ${pdfResult.images.length} 张图片`);
            } else {
              // PDF转换失败，显示错误
              const errorMsg = pdfResult?.error || 'PDF转换失败，未知错误';
              debugError('PDF转换失败:', errorMsg);
              debugError('完整的PDF转换结果:', pdfResult);
              
              // 显示用户友好的错误信息
              let userErrorMsg = errorMsg;
              if (errorMsg.includes('worker')) {
                userErrorMsg = 'PDF处理器加载失败，请刷新页面后重试';
              } else if (errorMsg.includes('不支持视觉输入')) {
                userErrorMsg = '当前模型不支持PDF文件，请选择支持视觉的模型（如GPT-4V、Claude 3等）';
              }
              
              setUploadedFiles(prev => prev.map(f =>
                f.id === fileObj.id
                  ? { ...f, uploading: false, uploadError: `PDF处理失败: ${userErrorMsg}` }
                  : f
              ));
              
              // 显示错误提示
              alert(`PDF上传失败: ${userErrorMsg}`);
            }
          } catch (pdfError) {
            debugError('PDF转换过程中发生异常:', pdfError);
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileObj.id
                ? { ...f, uploading: false, uploadError: `PDF转换异常: ${pdfError.message}` }
                : f
            ));
          }
        } else {
          // 非PDF文件或模型不支持视觉输入，按原流程上传
          debugLog('非PDF文件或模型不支持视觉输入，使用常规上传流程');
          
          // 检查API密钥
          if (!settings.apiKey || settings.apiKey.trim() === '') {
            debugError('API密钥未设置，无法上传文件');
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileObj.id
                ? { ...f, uploading: false, uploadError: '请先在设置中配置硅基流动API密钥' }
                : f
            ));
            continue;
          }
          
          try {
            const uploadResult = await uploadFileToSiliconFlow(file);
            debugLog('常规文件上传结果:', uploadResult);
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileObj.id
                ? { ...f, uploading: false, fileId: uploadResult.id }
                : f
            ));
          } catch (uploadError) {
            debugError('常规文件上传失败:', uploadError);
            let errorMessage = uploadError.message;
            if (errorMessage.includes('API密钥')) {
              errorMessage = '请先在设置中配置硅基流动API密钥';
            }
            setUploadedFiles(prev => prev.map(f =>
              f.id === fileObj.id
                ? { ...f, uploading: false, uploadError: `文件上传失败: ${errorMessage}` }
                : f
            ));
          }
        }
      } catch (error) {
        debugError('文件处理过程中发生未知错误:', error);
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileObj.id
            ? { ...f, uploading: false, uploadError: `处理失败: ${error.message || '未知错误'}` }
            : f
        ));
      }
    }
  };


  // 处理发送消息
  const handleSendMessage = async () => {
    debugLog('handleSendMessage called', { 
      inputMessage: inputMessage, 
      uploadedFilesLength: uploadedFiles.length,
      messagesLength: messages.length 
    });
    
    if (!inputMessage.trim() && uploadedFiles.length === 0) {
      debugLog('Early return: no message and no files');
      return;
    }

    // 检查是否需要自动网络搜索
    const shouldAutoWebSearch = settings.autoWebSearch && 
                               settings.enableWebSearch && 
                               settings.tavilyApiKey && 
                               inputMessage.trim();

    if (shouldAutoWebSearch) {
      // 如果启用了自动网络搜索，调用网络搜索处理函数
      await handleWebSearchClick();
      return;
    }

    const currentMessageFiles = [...uploadedFiles]; // Files associated with this specific message

    const userMessage = {
      id: generateId(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
      files: currentMessageFiles.length > 0 ? currentMessageFiles.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type,
        size: f.size,
        fileId: f.fileId, // 保存fileId用于重新生成
        pdfImages: f.pdfImages, // 保存PDF转换的图片用于重新生成
        processingStatus: f.processingStatus
      })) : undefined
    };

    const updatedMessages = [...messages, userMessage];
    debugLog('Setting messages with user message', { 
      previousLength: messages.length, 
      newLength: updatedMessages.length,
      userMessage 
    });
    updateMessages(() => updatedMessages);
    setInputMessage('');
    setUploadedFiles([]); // Clear files from input area after associating with message
    setIsLoading(true);
    setIsGenerating(true);
    debugLog('State updated: isLoading=true, isGenerating=true');

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const messagesToSend = [];
      // System prompt is handled by callAIAPI

      // Add dialogue history (user and assistant messages)
      // Slice from updatedMessages to include the latest user message
      const historyMessages = updatedMessages.slice(-settings.maxContextSize * 2); // Rough estimate for pairs
      messagesToSend.push(...historyMessages);

      const aiMessageId = generateId();
      const aiMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '', // Placeholder for streaming
        reasoning_content: '', // 新增：推理过程
        thinkingTime: null, // 新增：思考用时
        thinkingStartTime: Date.now(), // 记录开始思考时间
        isThinkingComplete: false, // 新增：推理是否完成
        timestamp: new Date().toISOString(),
        model: settings.selectedModel.name // Store model name with message
      };

      updateMessages(prevMessages => [...prevMessages, aiMessage]);

      const onStreamUpdate = (chunk, fullContent, reasoningContent) => {
        debugLog('🔄 onStreamUpdate 被调用:', { 
          chunk: chunk?.substring(0, 100) + (chunk?.length > 100 ? '...' : ''), 
          fullContentLength: fullContent?.length || 0,
          reasoningContentLength: reasoningContent?.length || 0,
          reasoningContent: reasoningContent?.substring(0, 200) + (reasoningContent?.length > 200 ? '...' : '') || 'empty'
        }); // 调试日志
        
        updateMessages(prevMsgs =>
          prevMsgs.map(msg =>
            msg.id === aiMessageId
              ? { 
                  ...msg, 
                  content: fullContent,
                  reasoning_content: reasoningContent
                }
              : msg
          )
        );
        
        // 推理内容始终显示，无需展开逻辑
        if (reasoningContent && reasoningContent.trim()) {
          debugLog('推理内容更新，消息ID:', aiMessageId);
        }
      };

      // 问题三修复：只对官方文档明确支持思考链的模型添加推理过程要求
      // 使用ApiService中的推理模型判断函数
      const isReasoningModel = isReasoningModelBySiliconFlow(settings.selectedModel.model);
      
      // Pass currentMessageFiles (which includes fileId if uploaded) to callAIAPI
      const aiResponse = await callAIAPI(messagesToSend, settings, currentMessageFiles, onStreamUpdate, controller.signal);

      // 计算推理用时并更新消息
      updateMessages(prev => prev.map(msg => {
        if (msg.id === aiMessageId && msg.thinkingStartTime && !msg.thinkingTime) {
          return {
            ...msg,
            thinkingTime: ((Date.now() - msg.thinkingStartTime) / 1000).toFixed(1),
            isThinkingComplete: true
          };
        }
        return msg;
      }));

      // 流式更新已经处理了所有内容，无需额外的setMessages调用

      // 仅当未使用流式回调时（即onStreamUpdate为null），才追加AI消息，避免重复
      if (!onStreamUpdate) {
        updateMessages(prevMessages => [
          ...prevMessages,
          {
            id: aiMessageId,
            role: 'assistant',
            content: aiResponse,
            reasoning_content: '',
            thinkingTime: null,
            timestamp: new Date().toISOString(),
            model: settings.selectedModel.name
          }
        ]);
      }

      // Update current conversation with all messages including the final AI response
      // Need to find the final state of messages after streaming
      // The setMessages inside onStreamUpdate and the one above handle this.
      // We need to use the state of messages *after* the streaming is complete.
      // This will be handled by the autoSaveCurrentConversation in its useEffect.

    } catch (error) {
      debugError('发送消息失败:', error);
      if (error.name !== 'AbortError') {
        const errorMessage = {
          id: generateId(),
          role: 'assistant', // Or 'system' for errors
          content: `发送消息失败: ${error.message}`,
          timestamp: new Date().toISOString(),
          isError: true,
          model: settings.selectedModel.name
        };
        // Remove the placeholder AI message and add error message
        updateMessages(prevMessages => {
          // 移除占位的AI消息（通过aiMessageId识别）
          const filteredMessages = prevMessages.filter(msg => msg.id !== aiMessageId);
          return [...filteredMessages, errorMessage];
        });
      }
    } finally {
      setIsLoading(false);
      setIsGenerating(false);
      setAbortController(null);
    }
  };

  // 停止生成
  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      // isLoading and isGenerating will be set to false in handleSendMessage's finally block
    }
  };

  // 处理发送或停止
  const handleSendOrStop = () => {
    if (isGenerating) {
      handleStopGeneration();
    } else {
      handleSendMessage();
    }
  };

  // 处理输入框变化
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    adjustTextareaHeight();
  };

  // 处理键盘按下事件
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating && !isLoading) { // Prevent send if already sending/generating
        handleSendMessage();
      }
    }
  };

  // 调整文本域高度
  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`; // Max height 150px
    }
  };

  // 切换设置面板显示
  const toggleSettings = () => {
    setShowSettings(!showSettings);
  };

  // 切换模型选择下拉框
  const toggleModelSelect = () => {
    setShowModelSelect(v => !v);
  };

  // 选择模型
  const selectModel = (model) => {
    setSettings({ ...settings, selectedModel: model });
    setShowModelSelect(false);
  };

  // 处理设置项变化
  const handleSettingChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : (type === 'number' ? Number(value) : value);
    
    // 如果是maxTokens设置，确保不超过当前模型的最大限制
    if (name === 'maxTokens' && type === 'number') {
      const modelMaxTokens = settings.selectedModel?.maxTokens || 4000;
      processedValue = Math.min(processedValue, modelMaxTokens);
    }
    
    setSettings(prevSettings => ({
      ...prevSettings,
      [name]: processedValue
    }));
  };

  // 保存设置
  const saveSettings = () => {
    localStorage.setItem('aiChatSettings', JSON.stringify(settings));
    toggleSettings();

    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity duration-300';
    toast.textContent = '保存成功';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };


  // 使用 useEffect 钩子
  useEffect(() => {
    // 加载保存的设置
    const savedSettings = localStorage.getItem('aiChatSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings);
        // 确保选中的模型在当前可用模型列表中
        const savedModel = parsedSettings.selectedModel;
        const modelExists = AI_MODELS.find(m => m.model === savedModel?.model);
        setSettings({
          ...parsedSettings,
          selectedModel: modelExists || AI_MODELS[0] // 如果保存的模型不存在，使用默认模型
        });
      } catch (error) {
        debugError('解析保存的设置失败:', error);
      }
    }

    // 加载保存的对话历史
    const savedConversations = localStorage.getItem('aiConversations');
    if (savedConversations) {
      try {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
        if (parsedConversations.length > 0) {
          setCurrentConversation(parsedConversations[0]);
        } else {
          startNewConversation();
        }
      } catch (error) {
        debugError('解析保存的对话历史失败:', error);
        startNewConversation();
      }
    } else {
      startNewConversation();
    }

    // 加载收藏的模型
    const savedFavorites = localStorage.getItem('favoriteModels');
    if (savedFavorites) {
      try {
        setFavoriteModels(JSON.parse(savedFavorites));
      } catch (error) {
        debugError('解析收藏模型失败:', error);
      }
    }
  }, []);

  // 监听设置变化，自动获取模型列表
  useEffect(() => {
    if (settings.apiKey && settings.apiKey.trim() !== '') {
      fetchSiliconFlowModels();
    }
  }, [settings.apiKey]);

  // 监听模型变化，自动调整maxTokens设置
  useEffect(() => {
    if (settings.selectedModel?.maxTokens && settings.maxTokens > settings.selectedModel.maxTokens) {
      // 如果当前maxTokens超过了新模型的限制，自动调整为模型的最大值
      setSettings(prevSettings => ({
        ...prevSettings,
        maxTokens: Math.min(prevSettings.maxTokens, settings.selectedModel.maxTokens)
      }));
    }
  }, [settings.selectedModel]);

  // 自动保存当前对话 - 暂时禁用用于调试
  // useEffect(() => {
  //   autoSaveCurrentConversation();
  // }, [messages]);

  // 自动滚动到底部
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 调整文本域高度
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputMessage]);

  // 点击外部关闭模型选择下拉框
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modelSelectRef.current && !modelSelectRef.current.contains(event.target)) {
        setShowModelSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 过滤对话列表
  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 过滤模型列表
  const filteredModels = availableModels.filter(model =>
    model.name.toLowerCase().includes(modelSearchTerm.toLowerCase())
  );

  // 排序模型：收藏的在前面
  const sortedModels = filteredModels.sort((a, b) => {
    const aIsFavorite = favoriteModels.includes(a.model);
    const bIsFavorite = favoriteModels.includes(b.model);
    if (aIsFavorite && !bIsFavorite) return -1;
    if (!aIsFavorite && bIsFavorite) return 1;
    return 0;
  });

  // 渲染组件
  debugLog('Component rendering', { 
    messagesLength: messages.length, 
    isLoading, 
    isGenerating, 
    inputMessage: inputMessage.length,
    showTranslator 
  });
  
  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* 侧边栏头部 */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-800">{settings.assistantName}</h1>
            <div className="flex items-center space-x-2">
              
              {/* 设置按钮 */}
              <button
                onClick={toggleSettings}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="设置"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* 新对话按钮 */}
          <button
            onClick={startNewConversation}
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新对话</span>
          </button>

          {/* AI翻译按钮 */}
          <button
            onClick={() => setShowTranslator(true)}
            className="w-full mt-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center justify-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
            <span>AI 翻译</span>
          </button>

          {/* 搜索框 */}
          <div className="mt-4 relative">
            <input
              type="text"
              placeholder="搜索对话..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 对话列表 */}
        <div className="flex-1 overflow-y-auto">
          {/* 批量操作工具栏 */}
          {conversations.length > 0 && (
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between">
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>管理对话</span>
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 w-full">
                    <button
                      onClick={toggleSelectAll}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedConversations.size === conversations.length ? '取消全选' : '全选'}
                    </button>
                    <div className="flex-1"></div>
                    {selectedConversations.size > 0 && (
                      <button
                        onClick={() => setShowBatchDeleteConfirm(true)}
                        className="text-sm text-red-600 hover:text-red-800 flex items-center space-x-1"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>删除 ({selectedConversations.size})</span>
                      </button>
                    )}
                    <button
                      onClick={exitEditMode}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      完成
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="p-2 space-y-1">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`group relative p-3 rounded-xl cursor-pointer transition-colors ${
                  currentConversation?.id === conversation.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (isEditMode) {
                    toggleConversationSelection(conversation.id);
                  } else {
                    setCurrentConversation(conversation);
                  }
                }}
              >
                <div className="flex items-center space-x-3">
                  {isEditMode && (
                    <input
                      type="checkbox"
                      checked={selectedConversations.has(conversation.id)}
                      onChange={() => toggleConversationSelection(conversation.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      onClick={(e) => e.stopPropagation()}
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    {editingConversationId === conversation.id ? (
                      <input
                        type="text"
                        defaultValue={conversation.name}
                        onBlur={(e) => {
                          renameConversation(conversation.id, e.target.value);
                          setEditingConversationId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            renameConversation(conversation.id, e.target.value);
                            setEditingConversationId(null);
                          }
                        }}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-800 truncate">{conversation.name}</h3>
                        {conversation.systemPrompt && conversation.systemPrompt !== settings.systemPrompt && (
                          <span 
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            title="此对话有自定义系统角色设定"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </span>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conversation.lastUpdated).toLocaleDateString('zh-CN')}
                    </p>
                  </div>

                  {!isEditMode && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingConversationId(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded"
                        title="重命名"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                        title="删除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* 主聊天区域 */}
      <main className="flex-1 flex flex-col">
        {/* 聊天头部 */}
        <header className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-800">
                {currentConversation?.name || '新对话'}
              </h2>
              
              {/* 模型选择器 */}
              <div className="relative" ref={modelSelectRef}>
                <button
                  onClick={toggleModelSelect}
                  className="flex items-center space-x-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
                >
                  <span className="text-gray-700">{settings.selectedModel.name}</span>
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showModelSelect && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                    {/* 搜索框 */}
                    <div className="p-3 border-b border-gray-100">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="搜索模型..."
                          value={modelSearchTerm}
                          onChange={(e) => setModelSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* 模型列表 */}
                    <div className="max-h-60 overflow-y-auto">
                      {isLoadingModels ? (
                        <div className="p-4 text-center text-gray-500">
                          <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          加载模型列表...
                        </div>
                      ) : (
                        sortedModels.map((model) => (
                          <button
                            key={model.id + model.model}
                            onClick={() => selectModel(model)}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                              settings.selectedModel.model === model.model ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-sm">{model.name}</div>
                                <div className="text-xs text-gray-500 mt-1">{model.model}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {favoriteModels.includes(model.model) && (
                                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavoriteModel(model.model);
                                  }}
                                  className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                                  title={favoriteModels.includes(model.model) ? '取消收藏' : '收藏'}
                                >
                                  <svg className="w-4 h-4" fill={favoriteModels.includes(model.model) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 头部右侧按钮 */}
            <div className="flex items-center space-x-2">
              {/* 系统角色设定按钮 */}
              <button
                onClick={openSystemPromptEditor}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title="当前对话系统角色设定"
                disabled={!currentConversation}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </header>


        {/* 消息显示区域 */}
        <div 
          className={`flex-1 overflow-y-auto p-6 ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">开始新的对话</h3>
                <p className="text-gray-500">输入您的问题，我将为您提供帮助</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div key={message.id} className="flex items-start space-x-4">
                  {/* 头像 */}
                  <div className="flex-shrink-0">
                    {message.role === 'user' ? (
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        {settings.userAvatar ? (
                          <img src={settings.userAvatar} alt="用户头像" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    ) : message.role === 'status' ? (
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className={`w-8 h-8 ${message.isError ? 'bg-red-500' : 'bg-green-600'} rounded-full flex items-center justify-center`}>
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* 消息内容 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-800">
                        {message.role === 'user' ? '您' : 
                         message.role === 'status' ? '系统' :
                         settings.assistantName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString('zh-CN')}
                      </span>
                      {message.model && (
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {message.model}
                        </span>
                      )}
                      {message.thinkingTime && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                          思考时间: {message.thinkingTime}s
                        </span>
                      )}
                    </div>

                    {/* 推理过程显示 */}
                    {message.reasoning_content && message.reasoning_content.trim() && (
                      <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                            <span className="text-sm font-medium text-gray-700">推理过程</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 whitespace-pre-wrap font-mono bg-white p-3 rounded border">
                          {message.reasoning_content}
                        </div>
                      </div>
                    )}

                    {/* 网络搜索结果显示 */}
                    {message.isWebSearch && message.searchResults && (
                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center space-x-2 mb-3">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                          </svg>
                          <span className="text-sm font-medium text-green-800">网络搜索结果</span>
                          <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                            {message.searchResults.length} 条结果
                          </span>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {message.searchResults.slice(0, 3).map((result, idx) => (
                            <div key={idx} className="text-sm">
                              <div className="font-medium text-green-800 truncate">
                                {result.title || result.name || '无标题'}
                              </div>
                              <div className="text-green-600 text-xs truncate">
                                {result.url || result.link || '无链接'}
                              </div>
                              <div className="text-green-700 text-xs mt-1 line-clamp-2">
                                {result.content || result.snippet || result.description || '无内容'}
                              </div>
                            </div>
                          ))}
                          {message.searchResults.length > 3 && (
                            <div className="text-xs text-green-600">
                              还有 {message.searchResults.length - 3} 条结果...
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 消息正文 */}
                    <div className={`prose prose-sm max-w-none ${
                      message.role === 'user' ? 'bg-blue-50 border border-blue-200' : 
                      message.role === 'status' ? (message.isError ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200') :
                      'border border-gray-200'
                    } rounded-lg p-4`} style={{backgroundColor: message.role === 'assistant' ? '#f3f4f6' : undefined, color: message.role === 'assistant' ? '#374151' : undefined}}>
                      {message.role === 'user' || message.role === 'status' ? (
                        <div className="whitespace-pre-wrap break-words">{message.content}</div>
                      ) : (
                        <MarkdownRenderer content={message.content} />
                      )}

                      {/* 显示用户消息的文件 */}
                      {message.files && message.files.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-300">
                          <div className="text-sm text-blue-700 mb-2">附件:</div>
                          <div className="space-y-2">
                            {message.files.map((file) => (
                              <div key={file.id} className="flex items-center space-x-2 text-sm text-blue-600">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                <span>{file.name}</span>
                                <span className="text-xs text-blue-500">({(file.size / 1024).toFixed(1)} KB)</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* AI消息的操作按钮 */}
                    {message.role === 'assistant' && !message.isError && (
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={async () => {
                            try {
                              await navigator.clipboard.writeText(message.content);
                              // 显示复制成功提示
                              const toast = document.createElement('div');
                              toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
                              toast.textContent = '已复制到剪贴板';
                              document.body.appendChild(toast);
                              setTimeout(() => {
                                if (document.body.contains(toast)) {
                                  document.body.removeChild(toast);
                                }
                              }, 3000);
                            } catch (err) {
                              debugError('复制失败:', err);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="复制回答"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={async () => {
                            // 重新生成回答
                            const currentIndex = messages.findIndex(m => m.id === message.id);
                            if (currentIndex === -1) return;

                            // 找到对应的用户消息
                            const userMessageIndex = currentIndex - 1;
                            if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return;

                            const userMessage = messages[userMessageIndex];
                            
                            // 移除当前AI回答
                            const messagesWithoutCurrentAI = messages.slice(0, currentIndex);
                            updateMessages(() => messagesWithoutCurrentAI);
                            
                            setIsLoading(true);
                            setIsGenerating(true);

                            const controller = new AbortController();
                            setAbortController(controller);

                            try {
                              const messagesToSend = messagesWithoutCurrentAI.slice(-settings.maxContextSize * 2);

                              const aiMessageId = generateId();
                              const aiMessage = {
                                id: aiMessageId,
                                role: 'assistant',
                                content: '',
                                reasoning_content: '',
                                thinkingTime: null,
                                thinkingStartTime: Date.now(),
                                timestamp: new Date().toISOString(),
                                model: settings.selectedModel.name
                              };

                              updateMessages(prevMessages => [...prevMessages, aiMessage]);

                              const onStreamUpdate = (chunk, fullContent, reasoningContent) => {
                                updateMessages(prevMsgs =>
                                  prevMsgs.map(msg =>
                                    msg.id === aiMessageId
                                      ? { 
                                          ...msg, 
                                          content: fullContent,
                                          reasoning_content: reasoningContent
                                        }
                                      : msg
                                  )
                                );
                              };

                              // 获取用户消息关联的文件
                              // 重新生成时使用保存的文件信息
                              const userFiles = userMessage.files ? userMessage.files.map(fileInfo => ({
                                id: fileInfo.id,
                                name: fileInfo.name,
                                type: fileInfo.type,
                                size: fileInfo.size,
                                fileId: fileInfo.fileId, // 使用保存的fileId
                                pdfImages: fileInfo.pdfImages, // 使用保存的PDF图片
                                processingStatus: fileInfo.processingStatus,
                                file: null // 原始文件对象无法恢复，但不影响API调用
                              })) : [];

                              await callAIAPI(messagesToSend, settings, userFiles, onStreamUpdate, controller.signal);

                              // 计算推理用时并更新消息
                              updateMessages(prev => prev.map(msg => {
                                if (msg.id === aiMessageId && msg.thinkingStartTime && !msg.thinkingTime) {
                                  return {
                                    ...msg,
                                    thinkingTime: ((Date.now() - msg.thinkingStartTime) / 1000).toFixed(1),
                                    isThinkingComplete: true
                                  };
                                }
                                return msg;
                              }));

                            } catch (error) {
                              if (error.name !== 'AbortError') {
                                debugError('重新生成失败:', error);
                                const errorMessage = {
                                  id: generateId(),
                                  role: 'assistant',
                                  content: `重新生成失败: ${error.message}`,
                                  timestamp: new Date().toISOString(),
                                  isError: true,
                                  model: settings.selectedModel.name
                                };
                                
                                updateMessages(prevMessages => {
                                  const newMessages = [...prevMessages];
                                  newMessages[currentIndex] = errorMessage;
                                  return newMessages;
                                });
                              }
                            } finally {
                              setIsLoading(false);
                              setIsGenerating(false);
                              setAbortController(null);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="重新生成回答"
                          disabled={isLoading || isGenerating}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* 输入区域 */}
        <div className="border-t border-gray-200 p-6 bg-white">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
              <div className="p-4">
                <textarea
                  ref={textareaRef}
                  rows="1"
                  placeholder="输入您的问题..."
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full border-0 resize-none focus:outline-none text-gray-800 placeholder-gray-500 text-base leading-relaxed"
                  disabled={isLoading && isGenerating}
                  style={{
                    minHeight: '24px',
                    maxHeight: '200px',
                    height: 'auto'
                  }}
                />
              </div>
              
              {/* 显示上传文件预览 */}
              {uploadedFiles.length > 0 && (
                <div className="px-4 pt-2 pb-2 border-t border-gray-100">
                  <div className="flex flex-wrap gap-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className={`flex items-center px-2 py-1 rounded-lg text-xs ${
                        file.uploading ? 'bg-yellow-50 text-yellow-700 animate-pulse' :
                        file.uploadError ? 'bg-red-100 text-red-700' :
                        file.pdfImages ? 'bg-green-50 text-green-700' :
                        'bg-blue-50 text-blue-700'
                      }`}>
                        {file.uploading && (
                          <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {file.uploadError && (
                          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        )}
                        {file.pdfImages && (
                          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                        {!file.uploading && !file.uploadError && !file.pdfImages && file.fileId && (
                          <svg className="w-3 h-3 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className="truncate max-w-20" title={file.uploadError || file.name}>
                          {file.uploadError ? '上传失败' : file.pdfImages ? `PDF已转换(${file.pdfImages.length}页)` : file.name}
                        </span>
                        <button
                          onClick={() => removeUploadedFile(file.id)}
                          className={`ml-1 p-0.5 rounded hover:opacity-75 ${
                            file.uploading ? 'text-yellow-500 cursor-not-allowed' :
                            file.uploadError ? 'text-red-500' :
                            'text-blue-500'
                          }`}
                          disabled={file.uploading}
                          title="移除文件"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between px-4 pb-4 pt-2 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    id="fileUploadInput"
                    multiple
                    accept=".txt,.md,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUploadInput"
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    title="上传文件"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                  </label>
                  
                  {/* 网络搜索开关按钮 */}
                  <button
                    onClick={() => {
                      const updatedSettings = {
                        ...settings,
                        enableWebSearch: !settings.enableWebSearch
                      };
                      setSettings(updatedSettings);
                      localStorage.setItem('aiChatSettings', JSON.stringify(updatedSettings));
                    }}
                    className={`p-2 rounded-lg cursor-pointer transition-all duration-200 ${
                      settings.enableWebSearch && settings.tavilyApiKey
                        ? 'text-blue-600 bg-blue-50 hover:bg-blue-100 shadow-sm'
                        : 'text-gray-400 hover:text-gray-500 hover:bg-gray-50'
                    }`}
                    title={settings.enableWebSearch ? '关闭网络搜索' : '开启网络搜索'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                  

                </div>
                
                <div className="flex items-center space-x-3">
                  {!settings.selectedModel && (
                    <div className="text-xs text-red-500 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                      请先选择模型
                    </div>
                  )}
                  
                  {/* 自动网络搜索状态指示器 */}
                  {settings.autoWebSearch && settings.enableWebSearch && settings.tavilyApiKey && (
                    <div className="text-xs text-green-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      自动网络搜索已启用
                    </div>
                  )}
                  
                  <button
                    onClick={handleSendOrStop}
                    disabled={(!inputMessage.trim() && uploadedFiles.length === 0 && !isGenerating) || (!isGenerating && !settings.selectedModel)}
                    className={`px-6 py-2.5 rounded-xl font-medium transition-colors ${
                      isGenerating
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {isGenerating ? (
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        <span>停止</span>
                      </div>
                    ) : (
                      isLoading ? '发送中...' : '发送'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>


      {/* 设置面板 */}
      {showSettings && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleSettings}
          />
          <aside className="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-50 overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800">设置</h2>
              <button
                onClick={toggleSettings}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab 切换 */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveSettingsTab('general')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeSettingsTab === 'general'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>常规设置</span>
                </div>
              </button>
              <button
                onClick={() => setActiveSettingsTab('search')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeSettingsTab === 'search'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>网络搜索</span>
                </div>
              </button>
            </div>

            <div className="space-y-6">
              {/* 常规设置 Tab */}
              {activeSettingsTab === 'general' && (
                <>
                  {/* API 密钥设置 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">硅基流动 API 密钥</label>
                    <input
                      type="password"
                      name="apiKey"
                      value={settings.apiKey}
                      onChange={handleSettingChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="输入您的硅基流动API密钥"
                    />
                    <div className="text-xs text-gray-500 mt-2">
                      <a href="https://cloud.siliconflow.cn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        获取硅基流动API密钥 →
                      </a>
                    </div>
                  </div>

                  {/* 模型参数设置 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">模型参数</h3>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        温度 (Temperature): {settings.temperature}
                      </label>
                      <input
                        type="range"
                        name="temperature"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={handleSettingChange}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">控制回答的随机性，值越高越随机</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Top P: {settings.topP}
                      </label>
                      <input
                        type="range"
                        name="topP"
                        min="0"
                        max="1"
                        step="0.1"
                        value={settings.topP}
                        onChange={handleSettingChange}
                        className="w-full"
                      />
                      <div className="text-xs text-gray-500 mt-1">控制词汇选择的多样性</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        最大令牌数
                      </label>
                      <input
                        type="number"
                        name="maxTokens"
                        min="100"
                        max={settings.selectedModel?.maxTokens || 4000}
                        step="100"
                        value={settings.maxTokens}
                        onChange={handleSettingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`输入最大令牌数 (最大: ${settings.selectedModel?.maxTokens?.toLocaleString() || '4,000'})`}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        控制回答的最大长度 (100-{settings.selectedModel?.maxTokens?.toLocaleString() || '4,000'})
                        {settings.selectedModel?.maxTokens && (
                          <span className="ml-2 text-blue-600">
                            当前模型支持最大: {settings.selectedModel.maxTokens.toLocaleString()} tokens
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        上下文数量 (对话轮数)
                      </label>
                      <input
                        type="number"
                        name="maxContextSize"
                        min="1"
                        max="20"
                        value={settings.maxContextSize}
                        onChange={handleSettingChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="输入上下文数量"
                      />
                      <div className="text-xs text-gray-500 mt-1">保留的对话轮数 (1-20)</div>
                    </div>
                  </div>

                  {/* 系统角色设定 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">系统角色设定 (System Prompt)</label>
                    <textarea
                      rows="4"
                      name="systemPrompt"
                      value={settings.systemPrompt}
                      onChange={handleSettingChange}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="设定 AI 助手的角色特征和回答风格..."
                    />
                    <div className="text-xs text-gray-500 mt-2">定义AI助手的行为和回答风格</div>
                  </div>

                  {/* AI助手名字设置 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">AI助手名字</label>
                    <input
                      type="text"
                      name="assistantName"
                      value={settings.assistantName}
                      onChange={(e) => setSettings(prev => ({ ...prev, assistantName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="设置AI助手的显示名字"
                    />
                    <div className="text-xs text-gray-500 mt-2">自定义AI助手在对话中显示的名字</div>
                  </div>

                  {/* 功能开关 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">功能设置</h3>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-700">记录对话历史</span>
                        <div className="text-xs text-gray-500 mt-1">保存对话记录到本地存储</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="saveHistory"
                          checked={settings.saveHistory}
                          onChange={handleSettingChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-700">自动保存</span>
                        <div className="text-xs text-gray-500 mt-1">自动保存设置和对话</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="autoSave"
                          checked={settings.autoSave}
                          onChange={handleSettingChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {/* 网络搜索设置 Tab */}
              {activeSettingsTab === 'search' && (
                <>
                  {/* Tavily API Key 设置 */}
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <label className="text-sm font-medium text-green-800">Tavily API Key</label>
                    </div>
                    <input
                      type="password"
                      name="tavilyApiKey"
                      value={settings.tavilyApiKey}
                      onChange={handleSettingChange}
                      className="w-full px-4 py-3 border border-green-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="输入您的 Tavily API 密钥"
                    />
                    <div className="text-xs text-green-600 mt-2">
                      <a href="https://docs.tavily.com/documentation/api-reference/endpoint/search" target="_blank" rel="noopener noreferrer" className="hover:underline">
                        获取 Tavily API 密钥 →
                      </a>
                    </div>
                  </div>

                  {/* 网络搜索功能开关 */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2">搜索功能</h3>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                      <div>
                        <span className="text-sm font-medium text-gray-700">启用网络搜索</span>
                        <div className="text-xs text-gray-500 mt-1">允许AI通过网络搜索获取最新信息</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="enableWebSearch"
                          checked={settings.enableWebSearch}
                          onChange={handleSettingChange}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                      </label>
                    </div>
                  </div>

                  {/* 自动网络搜索设置 */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">自动网络搜索</span>
                        <div className="text-xs text-gray-500 mt-1">发送消息时自动进行网络搜索（需要先启用网络搜索功能）</div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          name="autoWebSearch"
                          checked={settings.autoWebSearch}
                          onChange={handleSettingChange}
                          disabled={!settings.enableWebSearch || !settings.tavilyApiKey}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"></div>
                      </label>
                    </div>
                  </div>

                  {/* 搜索结果数量设置 */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-sm font-medium text-gray-700">搜索结果数量</span>
                        <div className="text-xs text-gray-500 mt-1">设置每次网络搜索返回的结果数量（1-20条）</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          name="webSearchCount"
                          value={settings.webSearchCount}
                          onChange={handleSettingChange}
                          min="1"
                          max="20"
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">条</span>
                      </div>
                    </div>
                  </div>

                  {/* 搜索功能说明 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-800">
                        <div className="font-medium mb-1">如何使用网络搜索：</div>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>在输入框中输入您的问题</li>
                          <li>点击搜索图标按钮进行网络搜索</li>
                          <li>AI将基于搜索结果为您提供最新信息</li>
                          <li>搜索结果将显示在对话中</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* 保存按钮 */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={saveSettings}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>保存设置</span>
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* 批量删除确认弹窗 */}
      {showBatchDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-800">确认删除</h3>
            </div>
            <p className="text-gray-600 mb-6">
              确定要删除选中的 {selectedConversations.size} 个对话吗？此操作无法撤销。
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBatchDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                取消
              </button>
              <button
                onClick={batchDeleteConversations}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 系统角色设定编辑弹窗 */}
      {showSystemPromptEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200]">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center space-x-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>当前对话系统角色设定 (System Prompt)</span>
              </h3>
              <button
                onClick={closeSystemPromptEditor}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-3">
                系统角色设定用于定义AI助手在当前对话中的行为和回答风格。每个对话可以有独立的角色设定。
              </p>
              <textarea
                value={tempSystemPrompt}
                onChange={(e) => setTempSystemPrompt(e.target.value)}
                placeholder="请输入系统角色设定，例如：你是一个专业的编程助手，擅长解答技术问题..."
                className="w-full h-40 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={closeSystemPromptEditor}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                取消
              </button>
              <button
                onClick={saveSystemPrompt}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>保存</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI翻译弹窗 - 增强版本 */}
      {showTranslator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* 翻译器头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">AI 翻译</h2>
                  <p className="text-sm text-gray-500">智能语言翻译助手</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* 关闭按钮 */}
                <button
                  onClick={() => {
                    setShowTranslator(false);
                    setTranslatorSourceText('');
                    setTranslatorTargetText('');
                  }}
                  className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* 翻译设置栏 */}
            <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between space-x-4">
                {/* 模型选择 */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">翻译模型:</label>
                  <div className="relative">
                    <select
                      value={translatorSettings.selectedModel.id}
                      onChange={(e) => {
                        const selectedModel = AI_MODELS.find(m => m.id === e.target.value);
                        if (selectedModel) {
                          updateTranslatorSettings({
                            ...translatorSettings,
                            selectedModel
                          });
                        }
                      }}
                      className="px-3 py-1.5 pr-8 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[200px] appearance-none"
                    >
                      {AI_MODELS.map((model) => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 语言选择 */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">源语言:</label>
                    <select
                      value={translatorSettings.sourceLanguage}
                      onChange={(e) => {
                        updateTranslatorSettings({
                          ...translatorSettings,
                          sourceLanguage: e.target.value
                        });
                      }}
                      className="px-2 py-1 pr-6 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    >
                      <option value="auto">自动检测</option>
                      <option value="zh">中文</option>
                      <option value="en">英文</option>
                      <option value="ja">日文</option>
                      <option value="ko">韩文</option>
                      <option value="fr">法文</option>
                      <option value="de">德文</option>
                      <option value="es">西班牙文</option>
                      <option value="ru">俄文</option>
                    </select>
                  </div>
                  
                  <div className="text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium text-gray-700">目标语言:</label>
                    <select
                      value={translatorSettings.targetLanguage}
                      onChange={(e) => {
                        updateTranslatorSettings({
                          ...translatorSettings,
                          targetLanguage: e.target.value
                        });
                      }}
                      className="px-2 py-1 pr-6 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white appearance-none"
                    >
                      <option value="auto">自动检测</option>
                      <option value="zh">中文</option>
                      <option value="en">英文</option>
                      <option value="ja">日文</option>
                      <option value="ko">韩文</option>
                      <option value="fr">法文</option>
                      <option value="de">德文</option>
                      <option value="es">西班牙文</option>
                      <option value="ru">俄文</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* 翻译内容区域 */}
            <div className="flex-1 flex flex-col overflow-hidden" style={{minHeight: '400px'}}>
              {/* 上方输入区域 */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6 border-b border-gray-200">
                  <textarea
                    value={translatorSourceText}
                    onChange={(e) => setTranslatorSourceText(e.target.value)}
                    placeholder="输入文本并按回车"
                    className="w-full h-full resize-none border-0 focus:outline-none text-gray-800 text-base leading-relaxed"
                  />
                </div>
                
                {/* 输入区域底部工具栏 */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {translatorSourceText.length} 字符
                    </span>
                  </div>
                  
                  <button
                    onClick={async () => {
                      if (!translatorSourceText.trim()) {
                        alert('请输入要翻译的文本');
                        return;
                      }
                      
                      setIsTranslating(true);
                      setIsStreamingTranslation(true);
                      setTranslatorTargetText('');
                      
                      try {
                        // 智能翻译逻辑
                        let sourceLanguage = translatorSettings.sourceLanguage;
                        let targetLanguage = translatorSettings.targetLanguage;
                        
                        // 如果源语言或目标语言是自动检测，进行语言检测
                        if (sourceLanguage === 'auto' || targetLanguage === 'auto') {
                          const hasChineseChars = /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff\u3000-\u303f\uff00-\uffef]/.test(translatorSourceText);
                          const hasEnglishChars = /[a-zA-Z]/.test(translatorSourceText);
                          const chineseCount = (translatorSourceText.match(/[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/g) || []).length;
                          const englishCount = (translatorSourceText.match(/[a-zA-Z]/g) || []).length;
                          
                          // 检测源语言
                          if (sourceLanguage === 'auto') {
                            if (chineseCount > englishCount) {
                              sourceLanguage = 'zh';
                            } else if (englishCount > 0) {
                              sourceLanguage = 'en';
                            } else {
                              sourceLanguage = 'zh'; // 默认中文
                            }
                          }
                          
                          // 检测目标语言
                          if (targetLanguage === 'auto') {
                            if (sourceLanguage === 'zh') {
                              targetLanguage = 'en';
                            } else {
                              targetLanguage = 'zh';
                            }
                          }
                        }
                        
                        // 语言映射
                        const languageMap = {
                          'zh': '中文',
                          'en': '英文',
                          'ja': '日文',
                          'ko': '韩文',
                          'fr': '法文',
                          'de': '德文',
                          'es': '西班牙文',
                          'ru': '俄文'
                        };
                        
                        const sourceLangName = languageMap[sourceLanguage] || '未知语言';
                        const targetLangName = languageMap[targetLanguage] || '未知语言';
                        
                        let prompt;
                        if (targetLanguage === 'zh') {
                          prompt = `请将以下${sourceLangName}文本翻译成${targetLangName}，只返回翻译结果，不要添加任何解释或说明：\n\n${translatorSourceText}`;
                        } else {
                          prompt = `Please translate the following ${sourceLangName} text to ${targetLangName}. Only return the translation without any explanations:\n\n${translatorSourceText}`;
                        }
                        
                        const response = await fetch(translatorSettings.selectedModel.apiEndpoint, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${settings.apiKey}`
                          },
                          body: JSON.stringify({
                            model: translatorSettings.selectedModel.model,
                            messages: [{
                              role: 'user',
                              content: prompt
                            }],
                            temperature: 0.3,
                            max_tokens: 2000,
                            stream: true
                          })
                        });
                        
                        if (!response.ok) {
                          throw new Error(`翻译请求失败: ${response.status}`);
                        }
                        
                        const reader = response.body.getReader();
                        const decoder = new TextDecoder();
                        let translatedText = '';
                        
                        while (true) {
                          const { done, value } = await reader.read();
                          if (done) break;
                          
                          const chunk = decoder.decode(value);
                          const lines = chunk.split('\n');
                          
                          for (const line of lines) {
                            if (line.startsWith('data: ')) {
                              const data = line.slice(6);
                              if (data === '[DONE]') continue;
                              
                              try {
                                const parsed = JSON.parse(data);
                                if (parsed.choices && parsed.choices[0] && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                                  const content = parsed.choices[0].delta.content;
                                  translatedText += content;
                                  setTranslatorTargetText(translatedText);
                                }
                              } catch (e) {
                                continue;
                              }
                            }
                          }
                        }
                        
                        // 保存到历史记录
                        const historyItem = {
                          id: generateId(),
                          sourceText: translatorSourceText,
                          targetText: translatedText,
                          timestamp: new Date().toLocaleString('zh-CN'),
                          model: translatorSettings.selectedModel.name
                        };
                        
                        const newHistory = [historyItem, ...translationHistory.slice(0, 49)];
                        setTranslationHistory(newHistory);
                        localStorage.setItem('translationHistory', JSON.stringify(newHistory));
                        
                      } catch (error) {
                        debugError('翻译失败:', error);
                        setTranslatorTargetText(`翻译失败: ${error.message}`);
                      } finally {
                        setIsTranslating(false);
                        setIsStreamingTranslation(false);
                      }
                    }}
                    disabled={isTranslating || !translatorSourceText.trim()}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isTranslating
                        ? 'bg-gray-400 text-white cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isTranslating ? '翻译中...' : '翻译'}
                  </button>
                </div>
              </div>

              {/* 下方输出区域 */}
              <div className="flex-1 flex flex-col">
                <div className="flex-1 p-6">
                  <div className="w-full h-full text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
                    {translatorTargetText || '翻译结果将显示在这里...'}
                  </div>
                </div>
                
                {/* 输出区域底部工具栏 */}
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {translatorTargetText.length} 字符
                    </span>
                  </div>
                  
                  {translatorTargetText && (
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(translatorTargetText);
                          setShowCopyToast(true);
                          setTimeout(() => setShowCopyToast(false), 3000);
                        } catch (err) {
                          debugError('复制失败:', err);
                        }
                      }}
                      className="px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                    >
                      复制
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* 复制成功提示浮层 */}
          {showCopyToast && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>复制成功</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIChatInterface;
