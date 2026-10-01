import { request, authRequest } from '@/utils/request'

/** 我的错题列表（★ 需要登录） */
export function listWrong(pageNum = 1, pageSize = 10) {
  return authRequest({
    url: '/api/practice/wrong/list',
    method: 'GET',
    params: { pageNum, pageSize }        // ★ 改成 params
  })
}

/** 移出错题（★ 需要登录） */
export function removeWrong(questionId) {
  return authRequest({
    url: `/api/practice/wrong/${questionId}`,
    method: 'DELETE'
  })
}

/** 错题详情（★ 需要登录） */
export function getWrongDetail(questionId) {
  return authRequest({
    url: `/api/practice/wrong/${questionId}/detail`,
    method: 'GET'
  })
}