import { useState } from 'react'
import { Upload, FileText, AlertCircle } from 'lucide-react'

interface DataUploadProps {
  onDataUploaded: (data: any) => void
}

export default function DataUpload({ onDataUploaded }: DataUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [cancerType, setCancerType] = useState<string>('BRCA')
  const [uploading, setUploading] = useState(false)

  const cancerTypes = [
    { value: 'BRCA', label: '乳腺癌 (BRCA)' },
    { value: 'CRC', label: '结直肠癌 (CRC)' },
    { value: 'LUAD', label: '肺腺癌 (LUAD)' },
    { value: 'GBM', label: '胶质母细胞瘤 (GBM)' },
    { value: 'LUSC', label: '肺鳞癌 (LUSC)' },
    { value: 'DLBC', label: '弥漫性大B细胞淋巴瘤 (DLBC)' }
  ]

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('cancerType', cancerType)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()
      onDataUploaded(data)
    } catch (error) {
      console.error('上传失败:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-8">
        <h2 className="text-2xl font-bold text-white mb-6">数据上传</h2>

        {/* 癌症类型选择 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            选择癌症类型
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {cancerTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setCancerType(type.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  cancerType === type.value
                    ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                    : 'border-slate-600 bg-slate-700/30 text-slate-400 hover:border-slate-500'
                }`}
              >
                <div className="font-medium">{type.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 文件上传区域 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-300 mb-3">
            上传基因表达数据
          </label>
          <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-slate-500 transition-colors">
            <input
              type="file"
              accept=".csv,.txt,.tsv"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-300 mb-2">
                {selectedFile ? selectedFile.name : '点击上传或拖拽文件到此处'}
              </p>
              <p className="text-sm text-slate-500">
                支持 CSV, TXT, TSV 格式
              </p>
            </label>
          </div>
        </div>

        {/* 数据格式说明 */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-2">数据格式要求：</p>
              <ul className="list-disc list-inside space-y-1 text-blue-300/80">
                <li>第一行为基因名称</li>
                <li>第一列为样本ID</li>
                <li>数值为基因表达量（FPKM/TPM/RPKM）</li>
                <li>包含生存时间和生存状态列</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 上传按钮 */}
        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 disabled:text-slate-500 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              上传中...
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              开始上传
            </>
          )}
        </button>
      </div>
    </div>
  )
}
