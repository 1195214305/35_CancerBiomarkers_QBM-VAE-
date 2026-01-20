/**
 * 边缘函数: 算法对比接口
 * 路径: /api/compare
 *
 * 使用真实的机器学习算法进行生存分析
 */

import {
  calculateCIndex,
  kaplanMeier,
  RandomForestSurvival,
  CoxPH,
  calculateFeatureImportance,
  calculateAUC,
  calculateAccuracy
} from '../lib/ml-algorithms.js'

import {
  QBMVAE,
  SVMSurvival,
  GradientBoostingSurvival,
  ElasticNetSurvival,
  XGBoostSurvival
} from '../lib/qbm-vae.js'

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

    // 运行真实的算法对比
    const results = await runRealAlgorithmComparison(data, algorithms, apiKey)

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
 * 运行真实的算法对比
 */
async function runRealAlgorithmComparison(data, algorithms, apiKey) {
  const startTime = Date.now()

  // 解析数据
  const { X, survivalTimes, events, featureNames } = parseData(data)

  // 存储算法结果
  const algorithmResults = []

  // 运行每个选中的算法
  for (const algoId of algorithms) {
    const algoStartTime = Date.now()

    let model = null
    let predictions = null

    try {
      switch (algoId) {
        case 'QBM-VAE':
          model = new QBMVAE(X[0].length, 10, 50)
          model.fit(X, survivalTimes, events, 30, 0.001)
          predictions = model.predict(X)
          break

        case 'RandomForest':
          model = new RandomForestSurvival(50)
          model.fit(X, survivalTimes, events)
          predictions = model.predict(X)
          break

        case 'SVM':
          model = new SVMSurvival(1.0)
          model.fit(X, survivalTimes, events, 50, 0.01)
          predictions = model.predict(X)
          break

        case 'GradientBoosting':
          model = new GradientBoostingSurvival(50, 0.1)
          model.fit(X, survivalTimes, events)
          predictions = model.predict(X)
          break

        case 'ElasticNet':
          model = new ElasticNetSurvival(1.0, 0.5)
          model.fit(X, survivalTimes, events, 50, 0.01)
          predictions = model.predict(X)
          break

        case 'XGBoost':
          model = new XGBoostSurvival(100, 0.1, 3)
          model.fit(X, survivalTimes, events)
          predictions = model.predict(X)
          break

        default:
          throw new Error(`未知算法: ${algoId}`)
      }

      // 计算性能指标
      const cIndex = calculateCIndex(predictions, survivalTimes, events)
      const auc = calculateAUC(predictions, events)
      const accuracy = calculateAccuracy(predictions, events)
      const time = (Date.now() - algoStartTime) / 1000

      algorithmResults.push({
        name: algoId,
        cIndex,
        auc,
        accuracy,
        time
      })
    } catch (error) {
      console.error(`算法 ${algoId} 执行失败:`, error)
      // 如果算法失败，添加默认结果
      algorithmResults.push({
        name: algoId,
        cIndex: 0.5,
        auc: 0.5,
        accuracy: 0.5,
        time: 0,
        error: error.message
      })
    }
  }

  // 按 C-index 排序
  algorithmResults.sort((a, b) => b.cIndex - a.cIndex)

  // 生成生存曲线（使用最佳算法的预测）
  const bestPredictions = algorithmResults[0] ?
    await getPredictions(algorithmResults[0].name, X, survivalTimes, events) :
    new Array(X.length).fill(0.5)

  const riskGroups = bestPredictions.map(p => p > median(bestPredictions) ? 'high' : 'low')
  const survivalCurves = kaplanMeier(survivalTimes, events, riskGroups)

  // 生成特征重要性
  const featureImportance = calculateFeatureImportance(X, survivalTimes, events, featureNames)

  // 如果提供了千问API Key，调用AI生成解读
  let aiInsights = null
  if (apiKey) {
    aiInsights = await generateAIInsights(algorithmResults, apiKey)
  }

  return {
    algorithms: algorithmResults,
    survivalCurves,
    featureImportance: featureImportance.slice(0, 15),
    aiInsights,
    stats: data.stats,
    timestamp: new Date().toISOString(),
    totalTime: (Date.now() - startTime) / 1000
  }
}

/**
 * 解析上传的数据
 */
function parseData(data) {
  // 从dataPreview中提取特征矩阵
  const samples = data.dataPreview || []

  if (samples.length === 0) {
    throw new Error('数据为空')
  }

  // 提取特征名称（排除样本ID、生存时间、生存状态）
  const allKeys = Object.keys(samples[0])
  const featureNames = allKeys.filter(key =>
    !['id', 'sampleId', 'time', 'survivalTime', 'status', 'event'].includes(key.toLowerCase())
  )

  // 构建特征矩阵
  const X = samples.map(sample => {
    return featureNames.map(feature => {
      const value = parseFloat(sample[feature])
      return isNaN(value) ? 0 : value
    })
  })

  // 提取生存时间和事件
  const survivalTimes = samples.map(sample => {
    const time = parseFloat(sample.time || sample.survivalTime || sample.Time || sample.SurvivalTime)
    return isNaN(time) ? 1 : Math.max(0.1, time)
  })

  const events = samples.map(sample => {
    const status = parseInt(sample.status || sample.event || sample.Status || sample.Event)
    return isNaN(status) ? 0 : (status > 0 ? 1 : 0)
  })

  return { X, survivalTimes, events, featureNames }
}

/**
 * 获取特定算法的预测结果
 */
async function getPredictions(algoId, X, survivalTimes, events) {
  let model = null

  switch (algoId) {
    case 'QBM-VAE':
      model = new QBMVAE(X[0].length, 10, 50)
      model.fit(X, survivalTimes, events, 30, 0.001)
      return model.predict(X)

    case 'RandomForest':
      model = new RandomForestSurvival(50)
      model.fit(X, survivalTimes, events)
      return model.predict(X)

    case 'SVM':
      model = new SVMSurvival(1.0)
      model.fit(X, survivalTimes, events, 50, 0.01)
      return model.predict(X)

    case 'GradientBoosting':
      model = new GradientBoostingSurvival(50, 0.1)
      model.fit(X, survivalTimes, events)
      return model.predict(X)

    case 'ElasticNet':
      model = new ElasticNetSurvival(1.0, 0.5)
      model.fit(X, survivalTimes, events, 50, 0.01)
      return model.predict(X)

    case 'XGBoost':
      model = new XGBoostSurvival(100, 0.1, 3)
      model.fit(X, survivalTimes, events)
      return model.predict(X)

    default:
      return new Array(X.length).fill(0.5)
  }
}

/**
 * 计算中位数
 */
function median(arr) {
  const sorted = [...arr].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

/**
 * 调用千问API生成AI解读
 */
async function generateAIInsights(results, apiKey) {
  try {
    const prompt = `作为生物信息学专家，请分析以下癌症生物标志物挖掘的算法对比结果：

${results.map(r => `${r.name}: C-index=${r.cIndex.toFixed(4)}, AUC=${r.auc.toFixed(4)}, 准确率=${(r.accuracy * 100).toFixed(2)}%`).join('\n')}

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
