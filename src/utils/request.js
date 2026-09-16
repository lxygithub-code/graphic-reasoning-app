// 模拟数据：题库（10道图推题）
const mockQuestions = [
  {
    id: 1,
    content: '下列哪个图形是轴对称图形？',
    optionA: 'A. 平行四边形',
    optionB: 'B. 等腰梯形',
    optionC: 'C. 正六边形',
    optionD: 'D. 直角三角形',
    answer: 'C',
    analysis: '正六边形有6条对称轴，是轴对称图形。'
  },
  {
    id: 2,
    content: '下列图形中，哪个是中心对称图形？',
    optionA: 'A. 正三角形',
    optionB: 'B. 正方形',
    optionC: 'C. 正五边形',
    optionD: 'D. 线段',
    answer: 'B',
    analysis: '正方形绕中心旋转180°后与原图形重合，是中心对称图形。'
  },
  // ... 可再添加8题，为节省篇幅省略，实际使用时请补全
]

// 模拟用户数据
let mockUser = {
  id: 1,
  nickname: '图推达人',
  avatar: '/static/avatar.png',
  totalPracticeTime: 3600
}

// 封装请求
const request = (options) => {
  return new Promise((resolve, reject) => {
    // 模拟延迟
    setTimeout(() => {
      // 根据 url 模拟返回
      const url = options.url
      const method = options.method || 'GET'
      // 登录接口
      if (url === '/user/login') {
        resolve({
          openid: 'mock_openid_123',
          userInfo: mockUser
        })
        return
      }
      // 随机获取题目
      if (url === '/question/random') {
        const count = options.data?.count || 10
        // 从 mockQuestions 中取前 count 个
        const list = mockQuestions.slice(0, count)
        resolve(list)
        return
      }
      // 提交单题（刷题模式）
      if (url === '/practice/submit-single') {
        const data = options.data
        const q = mockQuestions.find(q => q.id === data.questionId)
        const isCorrect = q && q.answer === data.userAnswer
        resolve({
          isCorrect,
          correctAnswer: q?.answer,
          analysis: q?.analysis || '无解析'
        })
        return
      }
      // 提交整组（答题模式）
      if (url === '/practice/submit-exam') {
        const data = options.data
        // 计算正确数
        let correctCount = 0
        data.answers.forEach(a => {
          const q = mockQuestions.find(q => q.id === a.questionId)
          if (q && q.answer === a.userAnswer) correctCount++
        })
        resolve({
          examId: Date.now(),
          correctCount,
          totalCount: data.answers.length,
          totalTime: data.totalTime
        })
        return
      }
      // 收藏列表
      if (url === '/favorite/list') {
        // 模拟收藏了第1、3题
        resolve([mockQuestions[0], mockQuestions[2]])
        return
      }
      // 切换收藏
      if (url === '/favorite/toggle') {
        resolve({ success: true })
        return
      }
      // 练习历史
      if (url === '/practice/history') {
        resolve([
          { date: '2026-09-07', total: 20, correct: 15, time: 120 },
          { date: '2026-09-06', total: 18, correct: 12, time: 100 }
        ])
        return
      }
      // 用户统计（管理员用）
      if (url.startsWith('/admin/statistics')) {
        resolve({
          userGrowth: [10, 15, 20, 18, 25, 30, 28],
          totalPracticeTime: 12345
        })
        return
      }
      // 默认返回成功
      resolve({ msg: 'ok' })
    }, 300)
  })
}

export default request