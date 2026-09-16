const BASE_URL = 'http://localhost:8866';

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
