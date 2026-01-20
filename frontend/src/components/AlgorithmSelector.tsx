import { useState } from 'react'
import { Play, Loader2, Brain, Cpu } from 'lucide-react'

interface AlgorithmSelectorProps {
  data: any
  onResultsReady: (results: any) => void
  apiKey: string
}

export default function AlgorithmSelector({ data, onResultsReady, apiKey }: AlgorithmSelectorProps) {
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['QBM-VAE'])
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState(0)

  const algorithms = [
    { id: 'QBM-VAE', name: 'QBM-VAE', desc: '量子玻尔兹曼机-变分自编码器', icon: Brain, color: 'blue' },
    { id: 'RandomForest', name: 'Random Forest', desc: '随机森林', icon: Cpu, color: 'green' },
    { id: 'SVM', name: 'SVM', desc: '支持向量机', icon: Cpu, color: 'purple' },
    { id: 'GradientBoosting', name: 'Gradient Boosting', desc: '梯度提升树', icon: Cpu, color: 'orange' },
    { id: 'ElasticNet', name: 'Elastic Net', desc: '弹性网络', icon: Cpu, color: 'pink' },
    { id: 'XGBoost', name: 'XGBoost', desc: '极端梯度提升', icon: Cpu, color: 'yellow' }
  ]

  const toggleAlgorithm = (id: string) => {
    setSelectedAlgorithms(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    )
  }

  const runComparison = async () => {
    if (!data || selectedAlgorithms.length === 0) return

    setRunning(true)
    setProgress(0)

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data,
          algorithms: selectedAlgorithms,
          apiKey
        })
      })

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6))
              if (data.progress) {
                setProgress(data.progress)
              }
              if (data.results) {
                onResultsReady(data.results)
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('对比失败:', error)
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">算法选择与对比</h2>

        {!data && (
          <div className="text-center py-12 text-slate-400">
            <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>请先上传数据</p>
          </div>
        )}

        {data && (
          <>
            {/* 算法选择 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {algorithms.map(algo => (
                <button
                  key={algo.id}
                  onClick={() => toggleAlgorithm(algo.id)}
                  disabled={running}
                  className={`p-6 rounded-lg border-2 transition-all text-left ${
                    selectedAlgorithms.includes(algo.id)
                      ? `border-${algo.color}-500 bg-${algo.color}-500/20`
                      : 'border-slate-600 bg-slate-700/30 hover:border-slate-500'
                  } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${algo.color}-500/20`}>
                      <algo.icon className={`w-6 h-6 text-${algo.color}-400`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{algo.name}</h3>
                      <p className="text-sm text-slate-400">{algo.desc}</p>
                    </div>
                    {selectedAlgorithms.includes(algo.id) && (
                      <div className={`w-6 h-6 rounded-full bg-${algo.color}-500 flex items-center justify-center`}>
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* 运行按钮 */}
            <button
              onClick={runComparison}
              disabled={running || selectedAlgorithms.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
            >
              {running ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  运行中... {progress}%
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  开始对比分析
                </>
              )}
            </button>

            {/* 进度条 */}
            {running && (
              <div className="mt-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
