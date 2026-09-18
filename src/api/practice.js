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