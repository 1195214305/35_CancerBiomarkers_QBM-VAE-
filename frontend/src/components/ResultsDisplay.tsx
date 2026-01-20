import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { TrendingUp, Award, Clock, Database } from 'lucide-react'

interface ResultsDisplayProps {
  results: any
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (!results) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
          <div className="text-center py-12 text-slate-400">
            <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无对比结果</p>
            <p className="text-sm mt-2">请先上传数据并运行算法对比</p>
          </div>
        </div>
      </div>
    )
  }

  const { algorithms, metrics, survivalCurves, featureImportance } = results

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* 性能指标对比 */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">算法性能对比</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {algorithms.map((algo: any, idx: number) => (
            <div key={idx} className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white">{algo.name}</h3>
                {idx === 0 && (
                  <Award className="w-5 h-5 text-yellow-400" />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">C-index</span>
                  <span className="text-white font-mono">{algo.cIndex.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">AUC</span>
                  <span className="text-white font-mono">{algo.auc.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">准确率</span>
                  <span className="text-white font-mono">{(algo.accuracy * 100).toFixed(2)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">运行时间</span>
                  <span className="text-white font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {algo.time}s
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 性能对比柱状图 */}
        <div className="bg-slate-900/50 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">C-index 对比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={algorithms}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" domain={[0.5, 1]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="cIndex" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 生存曲线 */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">Kaplan-Meier 生存曲线</h2>
        <div className="bg-slate-900/50 rounded-lg p-6">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={survivalCurves}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="time"
                stroke="#94a3b8"
                label={{ value: '时间 (月)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis
                stroke="#94a3b8"
                label={{ value: '生存概率', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="highRisk" stroke="#ef4444" strokeWidth={2} name="高风险组" />
              <Line type="monotone" dataKey="lowRisk" stroke="#22c55e" strokeWidth={2} name="低风险组" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 特征重要性 */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">关键生物标志物</h2>
        <div className="bg-slate-900/50 rounded-lg p-6">
          <div className="space-y-3">
            {featureImportance.slice(0, 10).map((feature: any, idx: number) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-400 font-mono">{feature.gene}</div>
                <div className="flex-1">
                  <div className="h-8 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-end pr-3"
                      style={{ width: `${feature.importance * 100}%` }}
                    >
                      <span className="text-xs text-white font-medium">
                        {(feature.importance * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 数据统计 */}
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">数据集统计</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
            <Database className="w-8 h-8 text-blue-400 mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{results.stats.samples}</div>
            <div className="text-sm text-slate-400">样本数量</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
            <Database className="w-8 h-8 text-green-400 mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{results.stats.features}</div>
            <div className="text-sm text-slate-400">基因特征</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
            <Database className="w-8 h-8 text-purple-400 mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{results.stats.events}</div>
            <div className="text-sm text-slate-400">事件数</div>
          </div>
          <div className="bg-slate-700/30 rounded-lg p-6 border border-slate-600">
            <Database className="w-8 h-8 text-orange-400 mb-3" />
            <div className="text-2xl font-bold text-white mb-1">{results.stats.censored}</div>
            <div className="text-sm text-slate-400">删失数</div>
          </div>
        </div>
      </div>
    </div>
  )
}
