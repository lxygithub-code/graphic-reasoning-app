import { request, authRequest } from '@/utils/request'

/** 获取当前用户（★ 未登录时静默失败，不弹窗） */
export function getUserInfo() {
  return request({
    url: '/api/auth/me',
    method: 'GET'
  })
}

/** 更新昵称/头像（★ 需要登录） */
export function updateUserProfile(data) {
  return authRequest({                  // ★ 改成 authRequest
    url: '/api/auth/profile',
    method: 'PUT',
    data
  })
}