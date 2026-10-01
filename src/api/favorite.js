import { request, authRequest } from '@/utils/request'

/** 收藏/取消收藏（★ 需要登录） */
export function toggleFavorite(questionId) {
  return authRequest({
    url: '/api/favorite/toggle',
    method: 'POST',
    data: { questionId }
  })
}

/** 是否已收藏（★ 游客也能调，未登录返回 false） */
export function checkFavorite(questionId) {
  return request({                          // ★ 用 request 不弹登录框
    url: '/api/favorite/check',
    method: 'GET',
    params: { questionId }                  // ★ 改成 params
  })
}

/** 收藏列表（★ 需要登录） */
export function listFavorites(pageNum = 1, pageSize = 10) {
  return authRequest({
    url: '/api/favorite/list',
    method: 'GET',
    params: { pageNum, pageSize }           // ★ 改成 params
  })
}

/** 收藏详情（★ 需要登录） */
export function getFavoriteDetail(questionId) {
  return authRequest({                      // ★ 改成 authRequest
    url: `/api/favorite/${questionId}/detail`,
    method: 'GET'
  })
}