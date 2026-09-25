export const BASE_URL = 'http://192.168.0.146:8866'
// 图片基础路径
export const PIC_BASE = 'https://graphic-push-images.oss-cn-beijing.aliyuncs.com/static'

/**
 * 拼接图片完整 URL
 */
export const picUrl = (name?: string): string => {
  if (!name) return ''
  if (name.startsWith('http')) return name
  if (name.startsWith('/upload/') || name.startsWith('/pics/')) {
    return BASE_URL + name
  }
  return `${PIC_BASE}/${name}`
}

/**
 * 把对象拼成 query string（过滤 undefined / null / 空串）
 */
function buildQuery(params?: Record<string, any>): string {
  if (!params) return ''
  const parts: string[] = []
  Object.keys(params).forEach((key) => {
    const val = params[key]
    if (val === undefined || val === null || val === '') return
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
  })
  return parts.join('&')
}

// ★ 扩展 RequestOptions，让它支持 params
export interface RequestOptions extends Omit<UniApp.RequestOptions, 'url' | 'data'> {
  url: string
  data?: any
  params?: Record<string, any>
}

export function request<T = any>(options: RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    const method = (options.method || 'GET').toUpperCase()

    // ★ GET：用 params 拼 query；POST/PUT/DELETE：用 data 作为 body
    let finalUrl = BASE_URL + options.url
    let finalData: any = options.data

    if (method === 'GET') {
      // GET 时，params 和 data 都允许，合并后拼到 URL 上
      const merged = { ...(options.params || {}), ...(options.data || {}) }
      const qs = buildQuery(merged)
      if (qs) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs
      }
      finalData = undefined
    } else {
      // 非 GET 时，params 也拼到 URL（少数场景会用）
      const qs = buildQuery(options.params)
      if (qs) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + qs
      }
    }

    uni.request({
      url: finalUrl,
      method: method as any,
      data: finalData,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (uni.getStorageSync('token') || ''),
        ...(options.header || {})
      },
      success: (res: any) => {
        const { code, msg, data } = res.data
        if (code === 0) {
          resolve(data)
        } else if (code === 401) {
          uni.removeStorageSync('token')
          // 触发重新登录
          reject(res.data)
        } else {
          uni.showToast({ title: msg || '请求失败', icon: 'none' })
          reject(res.data)
        }
      },
      fail: reject
    })
  })
}

export default request