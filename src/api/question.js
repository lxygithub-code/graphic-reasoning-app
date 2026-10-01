import { request, authRequest } from '@/utils/request'

/** 随机抽题（★ 游客也能调） */
export function randomPractice(data) {
  return request({
    url: '/api/question/random',
    method: 'POST',
    data
  })
}

/** 按考试类型统计题目数量（★ 游客也能调） */
export function countByExamType() {
  return request({
    url: '/api/question/count-by-exam-type',
    method: 'GET'
  })
}

/** 题目详情（★ 含答案，必须登录） */
export function getQuestionDetail(id) {
  return authRequest({
    url: `/api/question/${id}`,
    method: 'GET'
  })
}