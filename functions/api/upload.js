/**
 * 边缘函数: 数据上传接口
 * 路径: /api/upload
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
    const formData = await request.formData()
    const file = formData.get('file')
    const cancerType = formData.get('cancerType')

    if (!file) {
      return new Response(JSON.stringify({ error: '未找到上传文件' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 读取文件内容
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    // 解析CSV数据
    const headers = lines[0].split(',').map(h => h.trim())
    const data = lines.slice(1).map(line => {
      const values = line.split(',')
      const row = {}
      headers.forEach((header, idx) => {
        row[header] = values[idx]?.trim()
      })
      return row
    })

    // 数据统计
    const stats = {
      samples: data.length,
      features: headers.length - 3, // 减去样本ID、生存时间、生存状态
      events: data.filter(row => row.status === '1').length,
      censored: data.filter(row => row.status === '0').length
    }

    return new Response(JSON.stringify({
      success: true,
      cancerType,
      fileName: file.name,
      stats,
      dataPreview: data.slice(0, 5),
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: '数据上传失败',
      message: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
}
