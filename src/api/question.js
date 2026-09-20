import request from '@/utils/request'

export function countByExamType() {
  return request({
    url: '/api/question/count-by-exam-type',
    method: 'GET'
  })
}