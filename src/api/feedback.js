import { request, authRequest } from '@/utils/request'

/** 提交意见 */
export function submitFeedback(data) {
  return authRequest({
    url: '/api/feedback/submit',
    method: 'POST',
    data
  })
}

/** 我的意见列表 */
export function listMyFeedback(pageNum = 1, pageSize = 10) {
  return authRequest({
    url: '/api/feedback/my',
    method: 'GET',
    params: { pageNum, pageSize }
  })
}

/** 意见详情 */
export function getFeedbackDetail(id) {
  return authRequest({
    url: `/api/feedback/${id}`,
    method: 'GET'
  })
}

/** 未读回复数 */
export function getFeedbackUnreadCount() {
  return authRequest({
    url: '/api/feedback/unread-count',
    method: 'GET'
  })
}