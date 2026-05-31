// PDF转图片处理模块
// 基于用户提供的Python代码逻辑，使用JavaScript实现

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

let pdfjsLib = null;
let isInitialized = false;

// 动态加载PDF.js库
async function initializePdfJs() {
  if (isInitialized && pdfjsLib) {
    return pdfjsLib;
  }
  
  try {
    debugLog('开始加载PDF.js库...');
    
    // 使用与测试工具相同的版本和加载方式
    if (!window.pdfjsLib) {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js';
      document.head.appendChild(script);
      
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
      
      // 设置worker路径
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
    }
    
    pdfjsLib = window.pdfjsLib;
    debugLog('PDF.js库加载成功');
    
    isInitialized = true;
    return pdfjsLib;
    
  } catch (error) {
    debugError('PDF.js库加载失败:', error);
    throw new Error(`PDF处理库加载失败: ${error.message}`);
  }
}

/**
 * 将PDF文件转换为Base64编码的图片（使用与测试工具相同的实现）
 * @param {File} pdfFile - PDF文件对象
 * @param {number} pageNum - 页面索引（从0开始），默认为0
 * @param {number} scale - 缩放比例，默认为1.0
 * @returns {Promise<{success: boolean, data?: string, error?: string}>}
 */
export async function convertPdfToBase64Image(pdfFile, pageNum = 0, scale = 1.0) {
  try {
    debugLog(`开始转换PDF第${pageNum + 1}页为图片，缩放比例: ${scale}`);
    
    // 初始化PDF.js库
    const pdfLib = await initializePdfJs();
    
    // 读取PDF文件
    debugLog('读取PDF文件数据...');
    const arrayBuffer = await pdfFile.arrayBuffer();
    debugLog('PDF文件读取成功，大小:', arrayBuffer.byteLength, 'bytes');
    
    // 转换为Uint8Array（PDF.js要求的格式）
    const uint8Array = new Uint8Array(arrayBuffer);
    debugLog('数据格式转换完成，Uint8Array大小:', uint8Array.length);
    
    // 加载PDF文档
    debugLog('加载PDF文档...');
    const pdf = await pdfLib.getDocument({ data: uint8Array }).promise;
    debugLog('PDF文档加载成功，总页数:', pdf.numPages);
    
    if (pdf.numPages === 0) {
      return {
        success: false,
        error: 'PDF文件为空或无法打开'
      };
    }
    
    // 检查页面索引是否有效
    if (pageNum >= pdf.numPages) {
      debugWarn(`请求的页面 ${pageNum} 超出范围，将使用第一页 (0)`);
      pageNum = 0;
    }
    
    // 获取指定页面
    const page = await pdf.getPage(pageNum + 1); // PDF.js页面索引从1开始
    
    // 设置视口和缩放
    const viewport = page.getViewport({ scale });
    
    // 创建canvas元素
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    // 渲染页面到canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    
    await page.render(renderContext).promise;
    
    // 转换为base64，使用JPEG格式和较低质量来减小文件大小（与测试工具相同）
    let dataUrl = canvas.toDataURL('image/jpeg', 0.7);
    let quality = 0.7;
    
    // 检查图片大小，如果仍然太大则进一步压缩
    const sizeInMB = (dataUrl.length * 0.75) / (1024 * 1024); // 估算base64大小
    debugLog(`初始图片大小: ${sizeInMB.toFixed(2)}MB`);
    
    if (sizeInMB > 4) {
      // 如果超过4MB，降低质量
      quality = 0.5;
      dataUrl = canvas.toDataURL('image/jpeg', quality);
      const newSizeInMB = (dataUrl.length * 0.75) / (1024 * 1024);
      debugLog(`压缩后图片大小: ${newSizeInMB.toFixed(2)}MB (质量: ${quality})`);
      
      if (newSizeInMB > 4) {
        // 如果还是太大，进一步降低质量
        quality = 0.3;
        dataUrl = canvas.toDataURL('image/jpeg', quality);
        const finalSizeInMB = (dataUrl.length * 0.75) / (1024 * 1024);
        debugLog(`最终图片大小: ${finalSizeInMB.toFixed(2)}MB (质量: ${quality})`);
      }
    }
    
    const finalSize = (dataUrl.length * 0.75) / (1024 * 1024);
    debugLog(`PDF转换完成，图片尺寸: ${canvas.width}x${canvas.height}，大小: ${finalSize.toFixed(2)}MB，质量: ${quality}`);
    
    // 返回不包含data:前缀的base64数据
    const base64Image = dataUrl.split(',')[1];
    
    debugLog(`成功将PDF第 ${pageNum + 1} 页转换为Base64图像`);
    
    return {
      success: true,
      data: base64Image
    };
    
  } catch (error) {
    debugError('转换PDF为图像时出错:', error);
    return {
      success: false,
      error: `转换PDF为图像失败: ${error.message}`
    };
  }
}

/**
 * 检查文件是否为PDF
 * @param {File} file - 文件对象
 * @returns {boolean}
 */
export function isPdfFile(file) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

/**
 * 检查模型是否为VL类视觉模型
 * @param {Object} model - 模型对象
 * @returns {boolean}
 */
export function isVisionModel(model) {
  if (!model || (!model.name && !model.model)) return false;
  
  const modelName = (model.name || '').toLowerCase();
  const modelPath = (model.model || '').toLowerCase();
  const searchText = `${modelName} ${modelPath}`;
  
  // 检查模型名称中是否包含视觉相关关键词
  const visionKeywords = [
    'vl', 'vision', 'visual', 'multimodal', 'mm',
    'qwen2-vl', 'qwen2.5-vl', 'qwen/qwen2.5-vl', 'qwen2.5-vl-32b', 'qwen2.5-vl-72b',
    'qwen2-VL', 'qwen2.5-VL', 'qwen/qwen2.5-VL', 'qwen2.5-VL-32b', 'qwen2.5-VL-72b',
    'glm-4v', 'claude-3', 'gpt-4-vision', 'gpt-4v', 'gemini-pro-vision',
    'internvl', '视觉模型'
  ];
  
  debugLog('检查模型是否为视觉模型:', {
    model,
    modelName,
    modelPath,
    searchText,
    visionKeywords
  });
  
  const isVision = visionKeywords.some(keyword => searchText.includes(keyword));
  debugLog('视觉模型检查结果:', isVision);
  
  return isVision;
}

/**
 * 为VL模型处理PDF文件（带超时保护）
 * @param {File} pdfFile - PDF文件
 * @param {Object} model - 当前选择的模型
 * @param {number} timeout - 超时时间（毫秒），默认30秒
 * @returns {Promise<{success: boolean, images?: Array, error?: string}>}
 */
export async function processPdfForVisionModel(pdfFile, model, timeout = 30000) {
  // 创建超时Promise
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error(`PDF处理超时（${timeout / 1000}秒），可能文件过大或处理复杂`));
    }, timeout);
  });

  // 创建实际处理Promise
  const processPromise = async () => {
    try {
      debugLog('开始处理PDF文件:', pdfFile.name);
      debugLog('PDF文件信息:', { size: pdfFile.size, type: pdfFile.type });
      
      // 检查文件是否为PDF
      if (!isPdfFile(pdfFile)) {
        debugError('文件不是PDF格式:', pdfFile.type);
        return {
          success: false,
          error: '文件不是PDF格式，请上传有效的PDF文件'
        };
      }
      
      // 检查模型是否支持视觉输入
      if (!isVisionModel(model)) {
        debugLog('模型不支持视觉输入:', model);
        return {
          success: false,
          error: '当前模型不支持视觉输入，请选择支持视觉的模型（如GPT-4V、Claude 3等）'
        };
      }
      
      // 检查文件大小（超过20MB可能导致处理缓慢）
      const maxRecommendedSize = 20 * 1024 * 1024; // 20MB
      if (pdfFile.size > maxRecommendedSize) {
        debugWarn(`PDF文件较大 (${(pdfFile.size / 1024 / 1024).toFixed(2)}MB)，处理可能需要较长时间`);
      }
      
      debugLog('开始读取PDF文件...');
      
      // 初始化PDF.js库
      let pdfLib;
      try {
        pdfLib = await initializePdfJs();
        debugLog('PDF.js库初始化成功');
      } catch (initError) {
        debugError('PDF.js库初始化失败:', initError);
        return {
          success: false,
          error: `PDF处理库初始化失败: ${initError.message}`
        };
      }
      
      // 读取PDF文件
      let arrayBuffer;
      try {
        arrayBuffer = await pdfFile.arrayBuffer();
        debugLog('PDF文件读取成功，大小:', arrayBuffer.byteLength);
      } catch (readError) {
        debugError('读取PDF文件失败:', readError);
        return {
          success: false,
          error: `读取PDF文件失败: ${readError.message}`
        };
      }
      
      // 转换为Uint8Array（PDF.js要求的格式）
      const uint8Array = new Uint8Array(arrayBuffer);
      debugLog('数据格式转换完成，Uint8Array大小:', uint8Array.length);
      
      debugLog('开始加载PDF文档...');
      
      let pdf;
      try {
        pdf = await pdfLib.getDocument({ data: uint8Array }).promise;
        debugLog('PDF文档加载成功，总页数:', pdf.numPages);
      } catch (loadError) {
        debugError('加载PDF文档失败:', loadError);
        return {
          success: false,
          error: `加载PDF文档失败: ${loadError.message}`
        };
      }
      
      const images = [];
      const maxPages = Math.min(pdf.numPages, 5); // 限制最多处理5页
      debugLog(`准备转换 ${maxPages} 页PDF为图片...`);
      
      // 转换每一页为图片（添加进度反馈）
      for (let i = 0; i < maxPages; i++) {
        debugLog(`开始转换第 ${i + 1} 页...`);
        
        try {
          // 为每页转换也添加超时保护
          const pageTimeout = 10000; // 每页10秒超时
          const pageTimeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`第${i + 1}页转换超时`)), pageTimeout);
          });
          
          const pageProcessPromise = convertPdfToBase64Image(pdfFile, i, 1.0);
          const result = await Promise.race([pageProcessPromise, pageTimeoutPromise]);
          
          if (result.success) {
            images.push({
              pageNumber: i + 1,
              base64: result.data,
              type: 'image/png'
            });
            debugLog(`第 ${i + 1} 页转换成功`);
          } else {
            debugWarn(`转换第 ${i + 1} 页失败:`, result.error);
            // 如果是关键页面失败，可以选择继续或停止
            if (i === 0) {
              // 第一页失败，返回错误
              return {
                success: false,
                error: `转换PDF第一页失败: ${result.error}`
              };
            }
          }
        } catch (pageError) {
          debugError(`转换第 ${i + 1} 页时发生异常:`, pageError);
          if (i === 0) {
            // 第一页异常，返回错误
            return {
              success: false,
              error: `转换PDF第一页异常: ${pageError.message}`
            };
          }
        }
        
        // 在页面之间添加小延迟，避免阻塞UI
        if (i < maxPages - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      debugLog(`PDF转换完成，成功转换 ${images.length} 页`);
      
      if (images.length === 0) {
        return {
          success: false,
          error: 'PDF转换失败，无法生成任何图片'
        };
      }
      
      return {
        success: true,
        images
      };
      
    } catch (error) {
      debugError('处理PDF文件时发生未知错误:', error);
      return {
        success: false,
        error: error.message || '处理PDF文件时发生未知错误'
      };
    }
  };

  // 使用Promise.race实现超时控制
  try {
    return await Promise.race([processPromise(), timeoutPromise]);
  } catch (error) {
    debugError('PDF处理被中断:', error);
    return {
      success: false,
      error: error.message || 'PDF处理被中断'
    };
  }
}
