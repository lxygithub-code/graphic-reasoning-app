import request from '@/utils/request'

export function listWrong(pageNum = 1, pageSize = 10) {
  return request({
    url: '/api/practice/wrong/list',
    method: 'GET',
    data: { pageNum, pageSize }
  })
}

export function removeWrong(questionId) {
  return request({
    url: `/api/practice/wrong/${questionId}`,
    method: 'DELETE'
  })
}

/** 错题详情 */
export function getWrongDetail(questionId) {
  return request({
    url: `/api/practice/wrong/${questionId}/detail`,
    method: 'GET'
  })
}