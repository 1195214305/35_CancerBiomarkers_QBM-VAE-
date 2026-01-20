import { useState } from 'react'
import { Key, Save, AlertCircle, CheckCircle } from 'lucide-react'

interface SettingsPanelProps {
  apiKey: string
  onApiKeyChange: (key: string) => void
}

export default function SettingsPanel({ apiKey, onApiKeyChange }: SettingsPanelProps) {
  const [localKey, setLocalKey] = useState(apiKey)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    onApiKeyChange(localKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">系统设置</h2>

        {/* 千问 API Key 配置 */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">
              千问 API Key
            </label>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  value={localKey}
                  onChange={(e) => setLocalKey(e.target.value)}
                  placeholder="请输入您的千问 API Key"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-11 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
              >
                <Save className="w-5 h-5" />
                保存
              </button>
            </div>
            {saved && (
              <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                API Key 已保存
              </div>
            )}
          </div>

          {/* API Key 说明 */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-300">
                <p className="font-medium mb-2">如何获取千问 API Key：</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-300/80">
                  <li>访问 <a href="https://dashscope.aliyun.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-200">阿里云百炼平台</a></li>
                  <li>登录并进入控制台</li>
                  <li>在 API-KEY 管理页面创建新的 API Key</li>
                  <li>复制 API Key 并粘贴到上方输入框</li>
                </ol>
                <p className="mt-3 text-xs text-blue-300/60">
                  注意：API Key 仅存储在您的浏览器本地，不会上传到服务器
                </p>
              </div>
            </div>
          </div>

          {/* 功能说明 */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">千问 API 功能</h3>
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">智能结果解读：</span>
                  <span className="text-slate-400 ml-2">使用千问大模型自动解读算法对比结果，生成专业的分析报告</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">生物标志物解释：</span>
                  <span className="text-slate-400 ml-2">为识别出的关键基因提供生物学功能和临床意义解释</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />
                <div>
                  <span className="font-medium">研究建议：</span>
                  <span className="text-slate-400 ml-2">基于分析结果提供后续研究方向和实验设计建议</span>
                </div>
              </div>
            </div>
          </div>

          {/* 关于项目 */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-lg font-bold text-white mb-4">关于本项目</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p>
                本项目复现论文：<span className="text-slate-300 font-medium">Efficient discovery of robust prognostic biomarkers and signatures in solid tumors</span>
              </p>
              <p>
                对比算法：QBM-VAE（量子玻尔兹曼机-变分自编码器）vs 传统机器学习算法
              </p>
              <p>
                数据集：SurvivalML（BRCA、CRC、LUAD、GBM、LUSC、DLBC）
              </p>
              <p className="mt-4 pt-4 border-t border-slate-700">
                本项目由 <a href="https://www.aliyun.com/product/esa" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">阿里云ESA</a> 提供边缘计算支持
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
