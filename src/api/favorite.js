import request from '@/utils/request'

export function toggleFavorite(questionId) {
  return request({
    url: '/api/favorite/toggle',
    method: 'POST',
    data: { questionId }
  })
}

export function checkFavorite(questionId) {
  return request({
    url: '/api/favorite/check',
    method: 'GET',
    data: { questionId }
  })
}

export function listFavorites(pageNum = 1, pageSize = 10) {
  return request({
    url: '/api/favorite/list',
    method: 'GET',
    data: { pageNum, pageSize }
  })
}

/**
 * ★ 收藏详情（供 pages/favorite/detail.vue 使用）
 */
export function getFavoriteDetail(questionId) {
  return request({
    url: `/api/favorite/${questionId}/detail`,
    method: 'GET'
  })
}