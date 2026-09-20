import request from '@/utils/request'

/** 获取某次练习的记录详情 */
export function getRecordDetail(recordId) {
  return request({
    url: `/api/practice/${recordId}/detail`,
    method: 'GET'
  })
}

/** 背题模式：单题核对 */
export function submitSingle(data) {
  return request({
    url: '/api/practice/submit-single',
    method: 'POST',
    data
  })
}

/** 刷题模式：整组交卷 */
export function submitExam(data) {
  return request({
    url: '/api/practice/submit-exam',
    method: 'POST',
    data
  })
}

export function submitComment(data) {
  return request({
    url: '/api/practice/comment',
    method: 'POST',
    data
  })
}

/** 查某题的评论列表 */
export function listComments(questionId, limit = 10) {
  return request({
    url: '/api/practice/comment/list',
    method: 'GET',
    data: { questionId, limit }
  })
}

/** 我的答题记录列表 */
export function listMyRecords(pageNum = 1, pageSize = 10) {
  return request({
    url: '/api/practice/records',
    method: 'GET',
    data: { pageNum, pageSize }
  })
}