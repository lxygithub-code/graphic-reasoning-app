import { request, authRequest } from '@/utils/request'

/** 获取某次练习的记录详情（★ 需要登录，只能看自己的记录） */
export function getRecordDetail(recordId) {
  return authRequest({
    url: `/api/practice/${recordId}/detail`,
    method: 'GET'
  })
}

/** 背题模式：单题核对（★ 需要登录） */
export function submitSingle(data) {
  return authRequest({
    url: '/api/practice/submit-single',
    method: 'POST',
    data
  })
}

/** 刷题模式：整组交卷（★ 需要登录） */
export function submitExam(data) {
  return authRequest({
    url: '/api/practice/submit-exam',
    method: 'POST',
    data
  })
}

/** 发表评论（★ 需要登录） */
export function submitComment(data) {
  return authRequest({
    url: '/api/practice/comment',
    method: 'POST',
    data
  })
}

/** 查某题的评论列表（★ 游客也能看，不要弹登录） */
export function listComments(questionId, limit = 10) {
  return request({
    url: '/api/practice/comment/list',
    method: 'GET',
    params: { questionId, limit }   // 注意：GET 用 params
  })
}

/** 我的答题记录列表（★ 需要登录） */
export function listMyRecords(pageNum = 1, pageSize = 10) {
  return authRequest({
    url: '/api/practice/records',
    method: 'GET',
    params: { pageNum, pageSize }   // 注意：GET 用 params
  })
}