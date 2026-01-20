import { useState } from 'react'
import { Upload, Settings, BarChart3, Brain, Cpu } from 'lucide-react'
import DataUpload from './components/DataUpload'
import AlgorithmSelector from './components/AlgorithmSelector'
import ResultsDisplay from './components/ResultsDisplay'
import SettingsPanel from './components/SettingsPanel'

function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'compare' | 'results' | 'settings'>('upload')
  const [uploadedData, setUploadedData] = useState<any>(null)
  const [comparisonResults, setComparisonResults] = useState<any>(null)
  const [qianwenApiKey, setQianwenApiKey] = useState<string>('')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 头部 */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Brain className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">癌症生物标志物挖掘</h1>
                <p className="text-sm text-slate-400">QBM-VAE vs 传统机器学习算法对比</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Cpu className="w-4 h-4" />
              <span>由阿里云ESA提供边缘计算支持</span>
            </div>
          </div>
        </div>
      </header>

      {/* 导航标签 */}
      <div className="border-b border-slate-700/50 bg-slate-900/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'upload', label: '数据上传', icon: Upload },
              { id: 'compare', label: '算法对比', icon: BarChart3 },
              { id: 'results', label: '结果分析', icon: Brain },
              { id: 'settings', label: '设置', icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'upload' && (
          <DataUpload onDataUploaded={setUploadedData} />
        )}
        {activeTab === 'compare' && (
          <AlgorithmSelector
            data={uploadedData}
            onResultsReady={setComparisonResults}
            apiKey={qianwenApiKey}
          />
        )}
        {activeTab === 'results' && (
          <ResultsDisplay results={comparisonResults} />
        )}
        {activeTab === 'settings' && (
          <SettingsPanel
            apiKey={qianwenApiKey}
            onApiKeyChange={setQianwenApiKey}
          />
        )}
      </main>

      {/* 页脚 */}
      <footer className="border-t border-slate-700/50 bg-slate-900/50 mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-slate-400">
          <p>本项目由 <a href="https://www.aliyun.com/product/esa" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">阿里云ESA</a> 提供加速、计算和保护</p>
          <p className="mt-2">论文复现：Efficient discovery of robust prognostic biomarkers and signatures in solid tumors</p>
        </div>
      </footer>
    </div>
  )
}

export default App
