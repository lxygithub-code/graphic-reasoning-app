<template>
  <view class="practice-container">
    <!-- 进度 -->
    <u-line-progress :percent="progress" activeColor="#2979ff" :height="10"></u-line-progress>
    <view class="question-area" v-if="!isFinished">
      <view class="question-number">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</view>
      <view class="question-content">{{ currentQuestion.content }}</view>
      <u-radio-group v-model="selected" @change="onAnswer" placement="column">
        <u-radio v-for="(opt, idx) in options" :key="idx" :label="opt.label" :name="opt.value">
          <view class="option-text">{{ opt.label }}. {{ opt.text }}</view>
        </u-radio>
      </u-radio-group>
      <!-- 刷题模式：立即显示反馈 -->
      <view v-if="mode === 0 && showFeedback" class="feedback">
        <u-tag :text="feedback.isCorrect ? '正确' : '错误'" :type="feedback.isCorrect ? 'success' : 'error'"></u-tag>
        <view class="analysis">{{ feedback.analysis }}</view>
        <u-button type="primary" size="small" @click="nextQuestion">下一题</u-button>
      </view>
      <!-- 答题模式：仅显示“下一题”按钮 -->
      <view v-if="mode === 1 && !showFeedback" class="next-btn">
        <u-button type="primary" size="small" @click="nextQuestion">下一题</u-button>
      </view>
    </view>
    <!-- 完成 -->
    <view v-else class="finish-area">
      <u-icon name="checkmark-circle" color="#19be6b" size="80"></u-icon>
      <text>练习完成！</text>
      <view v-if="mode === 1">
        <u-button type="primary" @click="submitExam">交卷</u-button>
      </view>
      <view v-else>
        <u-button type="default" @click="goHome">返回首页</u-button>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request.js'
export default {
  data() {
    return {
      mode: 0, // 0刷题 1答题
      questions: [],
      currentIndex: 0,
      selected: '',
      isFinished: false,
      showFeedback: false,
      feedback: { isCorrect: false, analysis: '' },
      startTime: 0,
      answers: [], // 答题模式收集
      userId: 1
    }
  },
  onLoad(options) {
    this.mode = parseInt(options.mode) || 0
    this.userId = this.$store.state.userInfo?.id || 1
    this.loadQuestions()
  },
  computed: {
    currentQuestion() {
      return this.questions[this.currentIndex] || {}
    },
    options() {
      const q = this.currentQuestion
      if (!q) return []
      return [
        { label: 'A', value: 'A', text: q.optionA },
        { label: 'B', value: 'B', text: q.optionB },
        { label: 'C', value: 'C', text: q.optionC },
        { label: 'D', value: 'D', text: q.optionD }
      ].filter(item => item.text) // 过滤空选项
    },
    progress() {
      return this.questions.length ? ((this.currentIndex) / this.questions.length * 100) : 0
    }
  },
  methods: {
    async loadQuestions() {
      const data = await request({ url: '/question/random', data: { count: 5 } }) // 每组5题
      this.questions = data
      this.startTime = Date.now()
    },
    async onAnswer(val) {
      if (this.mode === 0) {
        // 刷题模式：立即提交
        const timeSpent = (Date.now() - this.startTime) / 1000
        const res = await request({
          url: '/practice/submit-single',
          method: 'POST',
          data: {
            questionId: this.currentQuestion.id,
            userAnswer: val,
            timeSpent: Math.round(timeSpent),
            practiceMode: 0,
            userId: this.userId
          }
        })
        this.feedback = {
          isCorrect: res.isCorrect,
          analysis: res.analysis || '无解析'
        }
        this.showFeedback = true
      } else {
        // 答题模式：记录答案
        const timeSpent = (Date.now() - this.startTime) / 1000
        this.answers.push({
          questionId: this.currentQuestion.id,
          userAnswer: val,
          timeSpent: Math.round(timeSpent)
        })
        // 自动进入下一题
        this.nextQuestion()
      }
    },
    nextQuestion() {
      this.currentIndex++
      if (this.currentIndex >= this.questions.length) {
        this.isFinished = true
        if (this.mode === 1) {
          // 答题模式完成，点击“交卷”才会提交
        } else {
          // 刷题模式完成
        }
      } else {
        this.selected = ''
        this.showFeedback = false
        this.startTime = Date.now()
      }
    },
    async submitExam() {
      const totalTime = this.answers.reduce((sum, a) => sum + a.timeSpent, 0)
      const res = await request({
        url: '/practice/submit-exam',
        method: 'POST',
        data: {
          userId: this.userId,
          questionIds: this.questions.map(q => q.id),
          totalTime: totalTime,
          answers: this.answers
        }
      })
      // 跳转到结果页
      uni.navigateTo({
        url: `/pages/result/result?examId=${res.examId}&correct=${res.correctCount}&total=${res.totalCount}&time=${totalTime}`
      })
    },
    goHome() {
      uni.navigateBack()
    }
  }
}
</script>

<style scoped>
.practice-container {
  padding: 30rpx;
}
.question-area {
  margin-top: 30rpx;
}
.question-number {
  font-size: 28rpx;
  color: #999;
}
.question-content {
  font-size: 34rpx;
  margin: 20rpx 0;
  line-height: 1.6;
}
.option-text {
  font-size: 30rpx;
  margin-left: 10rpx;
}
.feedback {
  margin-top: 30rpx;
}
.analysis {
  margin: 20rpx 0;
  padding: 20rpx;
  background: #f0f0f0;
  border-radius: 10rpx;
  font-size: 28rpx;
}
.next-btn {
  margin-top: 40rpx;
  display: flex;
  justify-content: flex-end;
}
.finish-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}
.finish-area text {
  font-size: 40rpx;
  margin: 30rpx 0;
}
</style>