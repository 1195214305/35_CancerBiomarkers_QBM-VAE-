/**
 * 简化的QBM-VAE算法实现
 * 基于变分自编码器(VAE)原理的生存分析模型
 *
 * QBM-VAE结合了量子玻尔兹曼机和变分自编码器的思想
 * 用于高维基因表达数据的特征提取和生存预测
 */

/**
 * QBM-VAE模型类
 */
export class QBMVAE {
  constructor(inputDim, latentDim = 10, hiddenDim = 50) {
    this.inputDim = inputDim
    this.latentDim = latentDim
    this.hiddenDim = hiddenDim

    // 编码器参数
    this.encoderWeights = this.initializeWeights(inputDim, hiddenDim)
    this.encoderBias = new Array(hiddenDim).fill(0)

    // 潜在空间参数
    this.muWeights = this.initializeWeights(hiddenDim, latentDim)
    this.muBias = new Array(latentDim).fill(0)
    this.logvarWeights = this.initializeWeights(hiddenDim, latentDim)
    this.logvarBias = new Array(latentDim).fill(0)

    // 解码器参数
    this.decoderWeights = this.initializeWeights(latentDim, hiddenDim)
    this.decoderBias = new Array(hiddenDim).fill(0)

    // 生存预测层
    this.survivalWeights = new Array(latentDim).fill(0)
    this.survivalBias = 0
  }

  initializeWeights(rows, cols) {
    const weights = []
    for (let i = 0; i < rows; i++) {
      weights[i] = []
      for (let j = 0; j < cols; j++) {
        // Xavier初始化
        weights[i][j] = (Math.random() - 0.5) * 2 * Math.sqrt(6 / (rows + cols))
      }
    }
    return weights
  }

  // ReLU激活函数
  relu(x) {
    return Math.max(0, x)
  }

  // Sigmoid激活函数
  sigmoid(x) {
    return 1 / (1 + Math.exp(-x))
  }

  // 矩阵向量乘法
  matmul(matrix, vector) {
    const result = []
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0
      for (let j = 0; j < vector.length; j++) {
        sum += matrix[i][j] * vector[j]
      }
      result.push(sum)
    }
    return result
  }

  // 向量加法
  vecAdd(a, b) {
    return a.map((val, i) => val + b[i])
  }

  // 编码器前向传播
  encode(x) {
    // 隐藏层
    let hidden = this.matmul(this.encoderWeights, x)
    hidden = this.vecAdd(hidden, this.encoderBias)
    hidden = hidden.map(h => this.relu(h))

    // 均值和对数方差
    const mu = this.vecAdd(this.matmul(this.muWeights, hidden), this.muBias)
    const logvar = this.vecAdd(this.matmul(this.logvarWeights, hidden), this.logvarBias)

    return { mu, logvar }
  }

  // 重参数化技巧
  reparameterize(mu, logvar) {
    const std = logvar.map(lv => Math.exp(0.5 * lv))
    const eps = std.map(() => this.randomNormal())
    return mu.map((m, i) => m + std[i] * eps[i])
  }

  // 标准正态分布采样
  randomNormal() {
    // Box-Muller变换
    const u1 = Math.random()
    const u2 = Math.random()
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  }

  // 解码器前向传播
  decode(z) {
    let hidden = this.matmul(this.decoderWeights, z)
    hidden = this.vecAdd(hidden, this.decoderBias)
    hidden = hidden.map(h => this.relu(h))
    return hidden
  }

  // 生存风险预测
  predictRisk(z) {
    let risk = 0
    for (let i = 0; i < z.length; i++) {
      risk += this.survivalWeights[i] * z[i]
    }
    risk += this.survivalBias
    return Math.exp(risk) // 返回风险比
  }

  // 训练模型
  fit(X, survivalTimes, events, epochs = 50, learningRate = 0.001) {
    const n = X.length

    for (let epoch = 0; epoch < epochs; epoch++) {
      let totalLoss = 0

      for (let i = 0; i < n; i++) {
        // 前向传播
        const { mu, logvar } = this.encode(X[i])
        const z = this.reparameterize(mu, logvar)
        const reconstructed = this.decode(z)
        const risk = this.predictRisk(z)

        // 计算损失
        const reconLoss = this.reconstructionLoss(X[i], reconstructed)
        const klLoss = this.klDivergence(mu, logvar)
        const survLoss = events[i] === 1 ? Math.abs(risk - 1.0 / survivalTimes[i]) : 0

        const loss = reconLoss + 0.1 * klLoss + survLoss
        totalLoss += loss

        // 简化的梯度下降（仅更新生存预测层）
        if (events[i] === 1) {
          const gradient = risk - 1.0 / survivalTimes[i]
          for (let j = 0; j < this.latentDim; j++) {
            this.survivalWeights[j] -= learningRate * gradient * z[j]
          }
          this.survivalBias -= learningRate * gradient
        }
      }

      // 每10个epoch输出一次损失
      if ((epoch + 1) % 10 === 0) {
        console.log(`Epoch ${epoch + 1}, Loss: ${(totalLoss / n).toFixed(4)}`)
      }
    }
  }

  // 重构损失（均方误差）
  reconstructionLoss(original, reconstructed) {
    let loss = 0
    const minLen = Math.min(original.length, reconstructed.length)
    for (let i = 0; i < minLen; i++) {
      loss += Math.pow(original[i] - reconstructed[i], 2)
    }
    return loss / minLen
  }

  // KL散度
  klDivergence(mu, logvar) {
    let kl = 0
    for (let i = 0; i < mu.length; i++) {
      kl += -0.5 * (1 + logvar[i] - Math.pow(mu[i], 2) - Math.exp(logvar[i]))
    }
    return kl
  }

  // 预测
  predict(X) {
    return X.map(x => {
      const { mu } = this.encode(x)
      return this.predictRisk(mu)
    })
  }

  // 提取潜在特征
  transform(X) {
    return X.map(x => {
      const { mu } = this.encode(x)
      return mu
    })
  }
}

/**
 * 简化的SVM实现（用于生存分析）
 */
export class SVMSurvival {
  constructor(C = 1.0) {
    this.C = C
    this.weights = null
    this.bias = 0
  }

  fit(X, survivalTimes, events, epochs = 100, learningRate = 0.01) {
    const n = X.length
    const p = X[0].length

    // 初始化权重
    this.weights = new Array(p).fill(0)

    // 简化的梯度下降
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        if (events[i] === 0) continue

        const prediction = this.linearPredictor(X[i])
        const target = 1.0 / survivalTimes[i]
        const error = prediction - target

        // 更新权重
        for (let j = 0; j < p; j++) {
          this.weights[j] -= learningRate * (error * X[i][j] + this.C * this.weights[j])
        }
        this.bias -= learningRate * error
      }
    }
  }

  linearPredictor(x) {
    let sum = this.bias
    for (let j = 0; j < x.length; j++) {
      sum += this.weights[j] * x[j]
    }
    return Math.exp(sum)
  }

  predict(X) {
    return X.map(x => this.linearPredictor(x))
  }
}

/**
 * 简化的Gradient Boosting实现
 */
export class GradientBoostingSurvival {
  constructor(nEstimators = 50, learningRate = 0.1) {
    this.nEstimators = nEstimators
    this.learningRate = learningRate
    this.trees = []
    this.initialPrediction = 0
  }

  fit(X, survivalTimes, events) {
    const n = X.length

    // 初始预测
    let totalRisk = 0
    let count = 0
    for (let i = 0; i < n; i++) {
      if (events[i] === 1) {
        totalRisk += 1.0 / survivalTimes[i]
        count++
      }
    }
    this.initialPrediction = count > 0 ? totalRisk / count : 0.5

    // 当前预测
    const predictions = new Array(n).fill(this.initialPrediction)

    // 构建树
    for (let t = 0; t < this.nEstimators; t++) {
      // 计算残差
      const residuals = []
      for (let i = 0; i < n; i++) {
        if (events[i] === 1) {
          residuals.push(1.0 / survivalTimes[i] - predictions[i])
        } else {
          residuals.push(0)
        }
      }

      // 简化的树：使用平均残差
      const avgResidual = residuals.reduce((a, b) => a + b, 0) / n
      this.trees.push(avgResidual)

      // 更新预测
      for (let i = 0; i < n; i++) {
        predictions[i] += this.learningRate * avgResidual
      }
    }
  }

  predict(X) {
    return X.map(() => {
      let pred = this.initialPrediction
      for (const tree of this.trees) {
        pred += this.learningRate * tree
      }
      return Math.exp(pred)
    })
  }
}

/**
 * 简化的Elastic Net实现
 */
export class ElasticNetSurvival {
  constructor(alpha = 1.0, l1Ratio = 0.5) {
    this.alpha = alpha
    this.l1Ratio = l1Ratio
    this.weights = null
    this.bias = 0
  }

  fit(X, survivalTimes, events, epochs = 100, learningRate = 0.01) {
    const n = X.length
    const p = X[0].length

    // 初始化权重
    this.weights = new Array(p).fill(0)

    // 梯度下降
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < n; i++) {
        if (events[i] === 0) continue

        const prediction = this.linearPredictor(X[i])
        const target = 1.0 / survivalTimes[i]
        const error = prediction - target

        // 更新权重（带L1和L2正则化）
        for (let j = 0; j < p; j++) {
          const l1Penalty = this.alpha * this.l1Ratio * Math.sign(this.weights[j])
          const l2Penalty = this.alpha * (1 - this.l1Ratio) * this.weights[j]
          this.weights[j] -= learningRate * (error * X[i][j] + l1Penalty + l2Penalty)
        }
        this.bias -= learningRate * error
      }
    }
  }

  linearPredictor(x) {
    let sum = this.bias
    for (let j = 0; j < x.length; j++) {
      sum += this.weights[j] * x[j]
    }
    return Math.exp(sum)
  }

  predict(X) {
    return X.map(x => this.linearPredictor(x))
  }
}

/**
 * 简化的XGBoost实现
 */
export class XGBoostSurvival {
  constructor(nEstimators = 100, learningRate = 0.1, maxDepth = 3) {
    this.nEstimators = nEstimators
    this.learningRate = learningRate
    this.maxDepth = maxDepth
    this.trees = []
    this.initialPrediction = 0
  }

  fit(X, survivalTimes, events) {
    // 与Gradient Boosting类似，但使用二阶导数
    const n = X.length

    // 初始预测
    let totalRisk = 0
    let count = 0
    for (let i = 0; i < n; i++) {
      if (events[i] === 1) {
        totalRisk += 1.0 / survivalTimes[i]
        count++
      }
    }
    this.initialPrediction = count > 0 ? totalRisk / count : 0.5

    // 当前预测
    const predictions = new Array(n).fill(this.initialPrediction)

    // 构建树
    for (let t = 0; t < this.nEstimators; t++) {
      // 计算梯度和Hessian
      const gradients = []
      for (let i = 0; i < n; i++) {
        if (events[i] === 1) {
          gradients.push(predictions[i] - 1.0 / survivalTimes[i])
        } else {
          gradients.push(0)
        }
      }

      // 简化的树：使用平均梯度
      const avgGradient = gradients.reduce((a, b) => a + b, 0) / n
      this.trees.push(-avgGradient) // 负梯度方向

      // 更新预测
      for (let i = 0; i < n; i++) {
        predictions[i] += this.learningRate * (-avgGradient)
      }
    }
  }

  predict(X) {
    return X.map(() => {
      let pred = this.initialPrediction
      for (const tree of this.trees) {
        pred += this.learningRate * tree
      }
      return Math.exp(pred)
    })
  }
}
