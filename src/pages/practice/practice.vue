<template>
  <view class="practice-container">
    <!-- 进度 -->
    <u-line-progress :percent="progress" activeColor="#3a322c" inactiveColor="#e6ddc9" :height="10"></u-line-progress>

    <view class="question-area" v-if="!isFinished">
      <view class="question-number">第 {{ currentIndex + 1 }} / {{ questions.length }} 题</view>
      <view class="question-content">{{ currentQuestion.content }}</view>
      <u-radio-group v-model="selected" @change="onAnswer" placement="column" activeColor="#b03a2e">
        <u-radio v-for="(opt, idx) in options" :key="idx" :label="opt.label" :name="opt.value">
          <view class="option-text">{{ opt.label }}. {{ opt.text }}</view>
        </u-radio>
      </u-radio-group>

      <!-- 刷题模式：立即显示反馈 -->
      <view v-if="mode === 0 && showFeedback" class="feedback">
        <view class="feedback-head">
          <text class="feedback-tag" :class="feedback.isCorrect ? 'tag-ok' : 'tag-no'">
            {{ feedback.isCorrect ? '✓ 正确' : '✗ 错误' }}
          </text>
        </view>
        <view class="analysis">{{ feedback.analysis }}</view>
        <view class="next-btn">
          <view class="ink-btn" @click="nextQuestion">下一题</view>
        </view>
      </view>

      <!-- 答题模式：仅显示“下一题”按钮 -->
      <view v-if="mode === 1 && !showFeedback" class="next-btn">
        <view class="ink-btn" @click="nextQuestion">下一题</view>
      </view>
    </view>

    <!-- 完成 -->
    <view v-else class="finish-area">
      <view class="finish-seal">完</view>
      <text class="finish-text">练习完成！</text>
      <view v-if="mode === 1">
        <view class="ink-btn ink-btn-primary" @click="submitExam">交卷</view>
      </view>
      <view v-else>
        <view class="ink-btn" @click="goHome">返回</view>
      </view>
    </view>
  </view>
</template>

<script>
import request from '@/utils/request'

const CATEGORY_TITLES = {
  guokao: '国考专题',
  shengkao: '省考专题',
  shiye: '事业编专题',
  custom: '自定义刷题'
}

export default {
  data() {
    return {
      mode: 0, // 0刷题 1答题
      category: 'custom',
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
    this.category = options.category || 'custom'
    this.userId = this.$store.state.userInfo?.id || 1
    const title = CATEGORY_TITLES[this.category] || '练习'
    uni.setNavigationBarTitle({ title })
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
      const data = await request({
        url: '/question/random',
        data: { count: 5, category: this.category }
      }) // 每组5题
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

<style lang="scss" scoped>
.practice-container {
  min-height: 100vh;
  padding: 30rpx;
  background: #f6f1e4;
  box-sizing: border-box;
}
.question-area {
  margin-top: 40rpx;
}
.question-number {
  font-size: 26rpx;
  color: #8a8278;
  letter-spacing: 2rpx;
}
.question-content {
  font-size: 34rpx;
  color: #3a322c;
  line-height: 1.7;
  margin: 20rpx 0 30rpx;
  padding: 24rpx;
  background: #fbf7ec;
  border: 1rpx solid #e2d8c0;
  border-radius: 16rpx;
}
.option-text {
  font-size: 30rpx;
  color: #4a4238;
  margin-left: 10rpx;
  line-height: 1.6;
}
.feedback {
  margin-top: 30rpx;
}
.feedback-head {
  display: flex;
  align-items: center;
  margin-bottom: 16rpx;
}
.feedback-tag {
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
}
.tag-ok {
  color: #4e6e58;
}
.tag-no {
  color: #b03a2e;
}
.analysis {
  margin: 0 0 20rpx;
  padding: 24rpx;
  background: #fbf7ec;
  border: 1rpx solid #e2d8c0;
  border-left: 6rpx solid #b03a2e;
  border-radius: 12rpx;
  font-size: 28rpx;
  color: #5c5348;
  line-height: 1.7;
}
.next-btn {
  margin-top: 40rpx;
  display: flex;
  justify-content: flex-end;
}
/* 水墨按钮 */
.ink-btn {
  min-width: 200rpx;
  padding: 20rpx 48rpx;
  border-radius: 44rpx;
  background: #3a322c;
  color: #f6f1e4;
  font-size: 28rpx;
  letter-spacing: 2rpx;
  text-align: center;
  box-shadow: 0 6rpx 14rpx rgba(58, 50, 44, 0.2);

  &:active {
    opacity: 0.85;
  }
}
.ink-btn-primary {
  background: #b03a2e;
  box-shadow: 0 6rpx 14rpx rgba(176, 58, 46, 0.25);
}
.finish-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
}
.finish-seal {
  width: 96rpx;
  height: 96rpx;
  border: 4rpx solid #b03a2e;
  border-radius: 16rpx;
  color: #b03a2e;
  font-size: 48rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-6deg);
}
.finish-text {
  font-size: 40rpx;
  color: #3a322c;
  letter-spacing: 6rpx;
  margin: 30rpx 0 40rpx;
}
</style>
