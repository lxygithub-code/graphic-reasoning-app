//export const BASE_URL = 'http://192.168.56.1:8866'
export const BASE_URL = 'https://api.graphicmaster.cn'
export const PIC_BASE = 'https://image.graphicmaster.cn/static'

// ★ 旧 OSS 域名（数据库里存的）
const LEGACY_OSS_HOST = 'graphic-push-images.oss-cn-beijing.aliyuncs.com'
// ★ 新自定义域名
const NEW_OSS_HOST = 'image.graphicmaster.cn'

/**
 * 拼接图片完整 URL
 * - 完整 URL：如果是旧 OSS 域名，自动替换为新域名
 * - 相对路径：拼上 PIC_BASE
 */
export const picUrl = (name ?: string) : string => {
	if (!name) return ''

	// 完整 URL：替换旧域名为新域名
	if (name.startsWith('http')) {
		return name
			.replace(LEGACY_OSS_HOST, NEW_OSS_HOST)
			// 兼容 http 和 https，最终统一成 https
			.replace(/^http:\/\//, 'https://')
	}

	// 特殊前缀：走 API 域名
	if (name.startsWith('/upload/') || name.startsWith('/pics/')) {
		return BASE_URL + name
	}

	// 普通相对路径：拼到 PIC_BASE
	return `${PIC_BASE}/${name}`
}

/**
 * 把对象拼成 query string（过滤 undefined / null / 空串）
 */
function buildQuery(params ?: Record<string, any>) : string {
	if (!params) return ''
	const parts : string[] = []
	Object.keys(params).forEach((key) => {
		const val = params[key]
		if (val === undefined || val === null || val === '') return
		parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(val))}`)
	})
	return parts.join('&')
}

// ★ 扩展 RequestOptions，让它支持 params
export interface RequestOptions extends Omit<UniApp.RequestOptions, 'url' | 'data'> {
	url : string
	data ?: any
	params ?: Record<string, any>
}

export function request<T = any>(options : RequestOptions) : Promise<T> {
	return new Promise((resolve, reject) => {
		const method = (options.method || 'GET').toUpperCase()

		// ★ GET：用 params 拼 query；POST/PUT/DELETE：用 data 作为 body
		let finalUrl = BASE_URL + options.url
		let finalData : any = options.data

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
			success: (res : any) => {
				const { code, msg, data } = res.data
				if (code === 0) {
					resolve(data)
				} else if (code === 401) {
					uni.removeStorageSync('token')
					uni.removeStorageSync('userInfo')

					const err : any = new Error(msg || '未登录')
					err.code = 401
					err.msg = msg || '未登录'
					reject(err)   // ★ 不再 reject(res.data)，而是 reject 带 code 的错误
				} else {
					uni.showToast({ title: msg || '请求失败', icon: 'none' })
					reject(res.data)
				}
			},
			fail: reject
		})
	})
}

export function authRequest<T = any>(options : RequestOptions) : Promise<T> {
	return request<T>(options).catch((err : any) => {
		if (err && err.code === 401) {
			uni.showModal({
				title: '提示',
				content: '请先登录后再操作',
				confirmText: '去登录',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						uni.navigateTo({ url: '/pages/login/login' })
					}
				}
			})
		}
		return Promise.reject(err)
	})
}

export default request