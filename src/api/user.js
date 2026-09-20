import request from '@/utils/request'

/** 获取当前用户 */
export function getUserInfo() {
  return request({
    url: '/api/auth/me',
    method: 'GET'
  })
}

/** 更新昵称/头像 */
export function updateUserProfile(data) {
  return request({
    url: '/api/auth/profile',
    method: 'PUT',
    data
  })
}