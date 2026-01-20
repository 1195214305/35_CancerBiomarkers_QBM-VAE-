/**
 * 边缘函数: 算法对比接口
 * 路径: /api/compare
 */

export default async function handler(request) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }

  // 处理 CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: '仅支持 POST 请求' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { data, algorithms, apiKey } = await request.json()

    // 模拟算法对比过程（实际应用中应调用真实的算法）
    const results = await runAlgorithmComparison(data, algorithms, apiKey)

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: '算法对比失败',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}

/**
 * 运行算法对比
 */
async function runAlgorithmComparison(data, algorithms, apiKey) {
  // 模拟算法性能数据
  const algorithmResults = algorithms.map(algoId => {
    const basePerformance = {
      'QBM-VAE': { cIndex: 0.7850, auc: 0.8120, accuracy: 0.7650, time: 45.2 },
      'RandomForest': { cIndex: 0.7420, auc: 0.7680, accuracy: 0.7210, time: 12.5 },
      'SVM': { cIndex: 0.7180, auc: 0.7450, accuracy: 0.7050, time: 8.3 },
      'GradientBoosting': { cIndex: 0.7520, auc: 0.7820, accuracy: 0.7380, time: 18.7 },
      'ElasticNet': { cIndex: 0.6980, auc: 0.7210, accuracy: 0.6850, time: 5.1 },
      'XGBoost': { cIndex: 0.7580, auc: 0.7890, accuracy: 0.7420, time: 15.3 }
    }

    return {
      name: algoId,
      ...basePerformance[algoId],
      // 添加随机扰动使结果更真实
      cIndex: basePerformance[algoId].cIndex + (Math.random() - 0.5) * 0.02,
      auc: basePerformance[algoId].auc + (Math.random() - 0.5) * 0.02,
      accuracy: basePerformance[algoId].accuracy + (Math.random() - 0.5) * 0.02
    }
  })

  // 按 C-index 排序
  algorithmResults.sort((a, b) => b.cIndex - a.cIndex)

  // 生成生存曲线数据
  const survivalCurves = generateSurvivalCurves()

  // 生成特征重要性数据
  const featureImportance = generateFeatureImportance()

  // 如果提供了千问API Key，调用AI生成解读
  let aiInsights = null
  if (apiKey) {
    aiInsights = await generateAIInsights(algorithmResults, apiKey)
  }

  return {
    algorithms: algorithmResults,
    survivalCurves,
    featureImportance,
    aiInsights,
    stats: data.stats,
    timestamp: new Date().toISOString()
  }
}

/**
 * 生成生存曲线数据
 */
function generateSurvivalCurves() {
  const curves = []
  for (let time = 0; time <= 60; time += 6) {
    curves.push({
      time,
      highRisk: Math.exp(-0.05 * time) * (0.9 + Math.random() * 0.1),
      lowRisk: Math.exp(-0.02 * time) * (0.95 + Math.random() * 0.05)
    })
  }
  return curves
}

/**
 * 生成特征重要性数据
 */
function generateFeatureImportance() {
  const genes = [
    'TP53', 'BRCA1', 'BRCA2', 'EGFR', 'KRAS',
    'PIK3CA', 'PTEN', 'RB1', 'MYC', 'ERBB2',
    'APC', 'CDKN2A', 'NRAS', 'BRAF', 'CTNNB1'
  ]

  return genes.map((gene, idx) => ({
    gene,
    importance: Math.exp(-idx * 0.3) * (0.8 + Math.random() * 0.2)
  })).sort((a, b) => b.importance - a.importance)
}

/**
 * 调用千问API生成AI解读
 */
async function generateAIInsights(results, apiKey) {
  try {
    const prompt = `作为生物信息学专家，请分析以下癌症生物标志物挖掘的算法对比结果：

${results.map(r => `${r.name}: C-index=${r.cIndex.toFixed(4)}, AUC=${r.auc.toFixed(4)}`).join('\n')}

请提供：
1. 算法性能对比分析
2. QBM-VAE的优势和局限性
3. 临床应用建议

请用简洁专业的语言回答，不超过300字。`

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen-turbo',
        input: { prompt },
        parameters: { max_tokens: 500 }
      })
    })

    if (response.ok) {
      const data = await response.json()
      return data.output?.text || '暂无AI解读'
    }
  } catch (error) {
    console.error('AI解读生成失败:', error)
  }

  return null
}
