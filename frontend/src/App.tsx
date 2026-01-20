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
    <div className="min-h-screen bg-medical-gradient text-white relative overflow-hidden">
      {/* 背景装饰 - 数据可视化风格 */}
      <div className="absolute inset-0 bg-data-pattern opacity-50"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_50%)]"></div>

      {/* 头部 */}
      <header className="relative border-b border-primary/20 bg-slate-900/80 backdrop-blur-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg border border-primary/30">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  癌症生物标志物挖掘
                </h1>
                <p className="text-sm text-gray-400">QBM-VAE vs 传统机器学习算法对比</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Cpu className="w-4 h-4 text-primary" />
              <span>由阿里云ESA提供边缘计算支持</span>
            </div>
          </div>
        </div>
      </header>

      {/* 导航标签 */}
      <div className="relative border-b border-primary/20 bg-slate-900/50 backdrop-blur-sm">
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
                    ? 'text-primary border-b-2 border-primary bg-primary/10'
                    : 'text-gray-400 hover:text-gray-300 hover:bg-slate-800/30'
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
      <footer className="relative border-t border-primary/20 bg-slate-900/80 backdrop-blur-md mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-gray-400">
          <p>本项目由 <a href="https://www.aliyun.com/product/esa" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-secondary transition-colors">阿里云ESA</a> 提供加速、计算和保护</p>
          <p className="mt-2">论文复现：Efficient discovery of robust prognostic biomarkers and signatures in solid tumors</p>
        </div>
      </footer>
    </div>
  )
}

export default App
