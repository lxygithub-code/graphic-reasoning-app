// 临时使用的cpolar域名，每天更新
export const BASE_URL = 'http://192.168.0.146:8866';
// 图片基础路径
export const PIC_BASE = 'https://graphic-push-images.oss-cn-beijing.aliyuncs.com/static'

export const picUrl = (name) => {
  if (!name) return ''
  // 已是完整 URL
  if (name.startsWith('http')) return name
  // /upload/ 开头（后端上传目录）或 /pics/ 开头（本地静态目录）→ 直接拼 BASE_URL
  if (name.startsWith('/upload/') || name.startsWith('/pics/')) {
    return BASE_URL + name
  }
  // 纯文件名（如 icon-guokao.png）→ 拼到 /pics/ 下
  return `${PIC_BASE}/${name}`
}

export function request<T = any>(options: UniApp.RequestOptions): Promise<T> {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + (uni.getStorageSync('token') || ''),
        ...(options.header || {})
      },
      success: (res: any) => {
        const { code, msg, data } = res.data;
        if (code === 0) resolve(data);
        else if (code === 401) {
          uni.removeStorageSync('token');
          // 触发重新登录
          reject(res.data);
        } else {
          uni.showToast({ title: msg || '请求失败', icon: 'none' });
          reject(res.data);
        }
      },
      fail: reject
    });
  });
}

export default request;
