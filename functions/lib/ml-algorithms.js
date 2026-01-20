/**
 * 真实的机器学习算法实现库
 * 基于JavaScript实现的生存分析和机器学习算法
 */

/**
 * 计算C-index（一致性指数）
 * 用于评估生存模型的预测性能
 */
export function calculateCIndex(predictions, survivalTimes, events) {
  let concordant = 0
  let discordant = 0
  let tied = 0

  for (let i = 0; i < predictions.length; i++) {
    if (events[i] === 0) continue // 跳过删失样本

    for (let j = 0; j < predictions.length; j++) {
      if (i === j) continue
      if (survivalTimes[j] < survivalTimes[i]) continue

      if (predictions[i] > predictions[j]) {
        concordant++
      } else if (predictions[i] < predictions[j]) {
        discordant++
      } else {
        tied++
      }
    }
  }

  return (concordant + 0.5 * tied) / (concordant + discordant + tied)
}

/**
 * Kaplan-Meier生存曲线估计
 */
export function kaplanMeier(survivalTimes, events, riskGroups) {
  const highRisk = []
  const lowRisk = []

  // 分组
  const highRiskData = { times: [], events: [] }
  const lowRiskData = { times: [], events: [] }

  for (let i = 0; i < survivalTimes.length; i++) {
    if (riskGroups[i] === 'high') {
      highRiskData.times.push(survivalTimes[i])
      highRiskData.events.push(events[i])
    } else {
      lowRiskData.times.push(survivalTimes[i])
      lowRiskData.events.push(events[i])
    }
  }

  // 计算生存曲线
  const highCurve = computeKMCurve(highRiskData.times, highRiskData.events)
  const lowCurve = computeKMCurve(lowRiskData.times, lowRiskData.events)

  // 合并时间点
  const allTimes = [...new Set([...highCurve.map(p => p.time), ...lowCurve.map(p => p.time)])].sort((a, b) => a - b)

  const curves = []
  for (const time of allTimes) {
    const highSurv = interpolateSurvival(highCurve, time)
    const lowSurv = interpolateSurvival(lowCurve, time)
    curves.push({ time, highRisk: highSurv, lowRisk: lowSurv })
  }

  return curves
}

function computeKMCurve(times, events) {
  const data = times.map((t, i) => ({ time: t, event: events[i] }))
    .sort((a, b) => a.time - b.time)

  let survival = 1.0
  let atRisk = data.length
  const curve = [{ time: 0, survival: 1.0 }]

  for (let i = 0; i < data.length; i++) {
    if (data[i].event === 1) {
      survival *= (atRisk - 1) / atRisk
      curve.push({ time: data[i].time, survival })
    }
    atRisk--
  }

  return curve
}

function interpolateSurvival(curve, time) {
  if (time <= curve[0].time) return curve[0].survival
  if (time >= curve[curve.length - 1].time) return curve[curve.length - 1].survival

  for (let i = 0; i < curve.length - 1; i++) {
    if (time >= curve[i].time && time < curve[i + 1].time) {
      return curve[i].survival
    }
  }

  return curve[curve.length - 1].survival
}

/**
 * 简化的随机森林实现
 * 用于生存分析的风险预测
 */
export class RandomForestSurvival {
  constructor(nTrees = 100) {
    this.nTrees = nTrees
    this.trees = []
  }

  fit(X, survivalTimes, events) {
    const n = X.length
    const m = X[0].length

    for (let t = 0; t < this.nTrees; t++) {
      // Bootstrap采样
      const indices = []
      for (let i = 0; i < n; i++) {
        indices.push(Math.floor(Math.random() * n))
      }

      const X_boot = indices.map(i => X[i])
      const times_boot = indices.map(i => survivalTimes[i])
      const events_boot = indices.map(i => events[i])

      // 构建决策树
      const tree = this.buildTree(X_boot, times_boot, events_boot, m)
      this.trees.push(tree)
    }
  }

  buildTree(X, times, events, maxFeatures) {
    // 简化的决策树：使用中位数分割
    const n = X.length
    if (n < 5) {
      return { type: 'leaf', value: this.calculateRisk(times, events) }
    }

    // 随机选择特征
    const featureIdx = Math.floor(Math.random() * X[0].length)
    const values = X.map(x => x[featureIdx])
    const threshold = this.median(values)

    // 分割数据
    const leftIndices = []
    const rightIndices = []
    for (let i = 0; i < n; i++) {
      if (X[i][featureIdx] <= threshold) {
        leftIndices.push(i)
      } else {
        rightIndices.push(i)
      }
    }

    if (leftIndices.length === 0 || rightIndices.length === 0) {
      return { type: 'leaf', value: this.calculateRisk(times, events) }
    }

    return {
      type: 'node',
      featureIdx,
      threshold,
      left: this.buildTree(
        leftIndices.map(i => X[i]),
        leftIndices.map(i => times[i]),
        leftIndices.map(i => events[i]),
        maxFeatures
      ),
      right: this.buildTree(
        rightIndices.map(i => X[i]),
        rightIndices.map(i => times[i]),
        rightIndices.map(i => events[i]),
        maxFeatures
      )
    }
  }

  calculateRisk(times, events) {
    // 计算平均风险分数
    let totalRisk = 0
    let count = 0
    for (let i = 0; i < times.length; i++) {
      if (events[i] === 1) {
        totalRisk += 1.0 / times[i]
        count++
      }
    }
    return count > 0 ? totalRisk / count : 0
  }

  predict(X) {
    return X.map(x => {
      const predictions = this.trees.map(tree => this.predictTree(tree, x))
      return predictions.reduce((a, b) => a + b, 0) / predictions.length
    })
  }

  predictTree(tree, x) {
    if (tree.type === 'leaf') {
      return tree.value
    }

    if (x[tree.featureIdx] <= tree.threshold) {
      return this.predictTree(tree.left, x)
    } else {
      return this.predictTree(tree.right, x)
    }
  }

  median(arr) {
    const sorted = [...arr].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
  }
}

/**
 * 简化的Cox比例风险模型
 */
export class CoxPH {
  constructor() {
    this.coefficients = null
  }

  fit(X, survivalTimes, events, maxIter = 100) {
    const n = X.length
    const p = X[0].length

    // 初始化系数
    this.coefficients = new Array(p).fill(0)

    // 简化的梯度下降
    const learningRate = 0.01
    for (let iter = 0; iter < maxIter; iter++) {
      const gradient = this.computeGradient(X, survivalTimes, events)

      for (let j = 0; j < p; j++) {
        this.coefficients[j] += learningRate * gradient[j]
      }
    }
  }

  computeGradient(X, times, events) {
    const n = X.length
    const p = X[0].length
    const gradient = new Array(p).fill(0)

    for (let i = 0; i < n; i++) {
      if (events[i] === 0) continue

      const riskSet = []
      for (let j = 0; j < n; j++) {
        if (times[j] >= times[i]) {
          riskSet.push(j)
        }
      }

      const risks = riskSet.map(j => Math.exp(this.linearPredictor(X[j])))
      const totalRisk = risks.reduce((a, b) => a + b, 0)

      for (let k = 0; k < p; k++) {
        let weightedSum = 0
        for (let j = 0; j < riskSet.length; j++) {
          weightedSum += X[riskSet[j]][k] * risks[j] / totalRisk
        }
        gradient[k] += X[i][k] - weightedSum
      }
    }

    return gradient
  }

  linearPredictor(x) {
    let sum = 0
    for (let j = 0; j < x.length; j++) {
      sum += this.coefficients[j] * x[j]
    }
    return sum
  }

  predict(X) {
    return X.map(x => Math.exp(this.linearPredictor(x)))
  }
}

/**
 * 特征重要性计算（基于方差）
 */
export function calculateFeatureImportance(X, survivalTimes, events, featureNames) {
  const n = X.length
  const p = X[0].length
  const importance = []

  for (let j = 0; j < p; j++) {
    const feature = X.map(x => x[j])

    // 计算特征与生存时间的相关性
    let correlation = 0
    const meanFeature = feature.reduce((a, b) => a + b, 0) / n
    const meanTime = survivalTimes.reduce((a, b) => a + b, 0) / n

    let numerator = 0
    let denomFeature = 0
    let denomTime = 0

    for (let i = 0; i < n; i++) {
      if (events[i] === 1) {
        numerator += (feature[i] - meanFeature) * (survivalTimes[i] - meanTime)
        denomFeature += Math.pow(feature[i] - meanFeature, 2)
        denomTime += Math.pow(survivalTimes[i] - meanTime, 2)
      }
    }

    if (denomFeature > 0 && denomTime > 0) {
      correlation = Math.abs(numerator / Math.sqrt(denomFeature * denomTime))
    }

    importance.push({
      gene: featureNames[j],
      importance: correlation
    })
  }

  return importance.sort((a, b) => b.importance - a.importance)
}

/**
 * 计算AUC（ROC曲线下面积）
 */
export function calculateAUC(predictions, events) {
  const pairs = predictions.map((pred, i) => ({ pred, event: events[i] }))
    .sort((a, b) => b.pred - a.pred)

  let tp = 0
  let fp = 0
  const positives = events.filter(e => e === 1).length
  const negatives = events.length - positives

  if (positives === 0 || negatives === 0) return 0.5

  let auc = 0
  for (const pair of pairs) {
    if (pair.event === 1) {
      tp++
    } else {
      fp++
      auc += tp
    }
  }

  return auc / (positives * negatives)
}

/**
 * 计算准确率（基于中位数阈值）
 */
export function calculateAccuracy(predictions, events) {
  const threshold = predictions.reduce((a, b) => a + b, 0) / predictions.length
  let correct = 0

  for (let i = 0; i < predictions.length; i++) {
    const predicted = predictions[i] > threshold ? 1 : 0
    if (predicted === events[i]) {
      correct++
    }
  }

  return correct / predictions.length
}
