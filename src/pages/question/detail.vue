<template>
  <view class="q-preview-container">
    <!-- 加载中 -->
    <view v-if="loading" class="loading">加载中...</view>

    <template v-else-if="question.id">
      <!-- 题干 -->
      <view class="card">
        <view class="card-title">题目</view>
        <view class="question-content">{{ question.content }}</view>
        <image
          v-if="question.imageUrl"
          :src="picUrl(question.imageUrl)"
          class="question-image"
          mode="widthFix"
          referrer-policy="no-referrer"
          @click="previewImage(picUrl(question.imageUrl))"
        />
      </view>

      <!-- 选项 -->
      <view class="card">
        <view class="card-title">选项</view>
        <view class="options-list">
          <view
            v-for="(opt, idx) in question.options || []"
            :key="idx"
            class="option-item"
            :class="{
              correct: isLoggedIn && opt.key === question.correctOption
            }"
          >
            <text class="opt-key">{{ opt.key }}.</text>
            <text v-if="opt.type === 'text'" class="opt-text">{{ opt.value }}</text>
            <image
              v-else
              :src="picUrl(opt.value)"
              class="opt-image"
              mode="widthFix"
              referrer-policy="no-referrer"
              @click.stop="previewImage(picUrl(opt.value))"
            />
            <text
              v-if="isLoggedIn && opt.key === question.correctOption"
              class="opt-mark"
            >✓ 正确答案</text>
          </view>
        </view>
      </view>

      <!-- ★ 未登录：登录引导遮罩 -->
      <view v-if="!isLoggedIn" class="login-mask">
        <view class="mask-icon">🔒</view>
        <view class="mask-title">登录后查看答案和解析</view>
        <view class="mask-desc">解锁完整解析 · 分平台讲解</view>
        <view class="mask-btn" @click="goLogin">立即登录</view>
        <view class="mask-sub" @click="goBack">暂不登录，先返回</view>
      </view>

      <!-- ★ 已登录：答案 + 解析 -->
      <template v-else>
        <!-- 正确答案 -->
        <view class="card">
          <view class="card-title">正确答案</view>
          <view class="answer-highlight">{{ question.correctOption }}</view>
        </view>

        <!-- 解析 -->
        <view class="card">
          <view class="card-title">解析</view>
          <view v-if="question.analysis" class="analysis-content">{{ question.analysis }}</view>
          <view v-for="(a, ai) in question.analyses || []" :key="ai" class="platform-analysis">
            <view class="platform-tag">{{ platformLabel(a.platform) }}</view>
            <view v-if="a.type !== 'image'" class="platform-content">{{ a.content }}</view>
            <image
              v-else
              :src="picUrl(a.content)"
              class="platform-image"
              mode="widthFix"
              referrer-policy="no-referrer"
              @click.stop="previewImage(picUrl(a.content))"
            />
          </view>
          <view
            v-if="!question.analysis && (!question.analyses || !question.analyses.length)"
            class="empty"
          >暂无解析</view>
        </view>
      </template>

      <view class="bottom-space"></view>
    </template>

    <!-- 题目不存在 -->
    <view v-else class="empty-state">
      <text>题目不存在</text>
    </view>
  </view>
</template>

<script>
import { request, picUrl } from '@/utils/request'
import { getQuestionDetail } from '@/api/question'
import { listDict } from '@/api/dict'

export default {
  data() {
    return {
      questionId: null,
      question: {},
      isLoggedIn: false,
      loading: false,
      platformOptions: []
    }
  },

  onLoad(options) {
    this.questionId = options.id || options.questionId
    if (!this.questionId) {
      uni.showToast({ title: '参数错误', icon: 'none' })
      setTimeout(() => uni.navigateBack(), 800)
      return
    }

    this.isLoggedIn = !!uni.getStorageSync('token')
    this.loadPlatformOptions()
    this.loadPreview()

    // 已登录：顺便拿完整详情（答案 + 解析）
    if (this.isLoggedIn) {
      this.loadFullDetail()
    }
  },

  onShow() {
    // 从登录页返回时：如果刚登录成功，刷新完整详情
    const now = !!uni.getStorageSync('token')
    if (!this.isLoggedIn && now) {
      this.isLoggedIn = true
      this.loadFullDetail()
    }
  },

  methods: {
    picUrl,

    /** 游客也能拿到的题面 */
    async loadPreview() {
      this.loading = true
      try {
        const res = await request({
          url: `/api/question/${this.questionId}/preview`,
          method: 'GET'
        })
        this.question = res || {}
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    /** 已登录：拿答案和解析（覆盖到 question 上） */
    async loadFullDetail() {
      try {
        const res = await getQuestionDetail(this.questionId)
        // 合并：preview 的题面 + 完整详情的答案和解析
        this.question = { ...this.question, ...res }
      } catch (e) {
        // 401 已由 authRequest 处理，静默失败
      }
    },

    async loadPlatformOptions() {
      try {
        this.platformOptions = await listDict('analysis_platform') || []
      } catch (e) {}
    },

    platformLabel(val) {
      const item = this.platformOptions.find(o => o.dictValue === val)
      return item ? item.dictLabel : (val || '解析')
    },

    previewImage(url) {
      if (!url) return
      uni.previewImage({ urls: [url] })
    },

    goLogin() {
      uni.navigateTo({ url: '/pages/login/login' })
    },

    goBack() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.q-preview-container {
  min-height: 100vh;
  padding: 30rpx;
  background: #f6f1e4;
  box-sizing: border-box;
}

.loading,
.empty-state {
  text-align: center;
  font-size: 26rpx;
  color: #8a8278;
  padding: 100rpx 0;
}

/* 卡片通用 */
.card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.card-title {
  font-size: 26rpx;
  font-weight: 700;
  color: #3a322c;
  letter-spacing: 2rpx;
  margin-bottom: 16rpx;
  padding-bottom: 12rpx;
  border-bottom: 1rpx dashed #e2d8c0;
}

/* 题干 */
.question-content {
  font-size: 30rpx;
  color: #3a322c;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

.question-image {
  width: 100%;
  border-radius: 8rpx;
  background: #fff;
}

/* 选项 */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.option-item {
  display: flex;
  align-items: center;
  padding: 18rpx 20rpx;
  background: #f6f1e4;
  border: 2rpx solid transparent;
  border-radius: 10rpx;
  font-size: 28rpx;
}

.option-item.correct {
  background: #eef5ee;
  border-color: #4e6e58;
}

.opt-key {
  font-weight: 700;
  color: #3a322c;
  margin-right: 12rpx;
  flex-shrink: 0;
}

.opt-text {
  flex: 1;
  color: #4a4238;
  line-height: 1.6;
}

.opt-image {
  flex: 1;
  max-width: 400rpx;
  border-radius: 6rpx;
}

.opt-mark {
  font-size: 22rpx;
  font-weight: 700;
  margin-left: 12rpx;
  color: #4e6e58;
  flex-shrink: 0;
}

/* ★ 登录遮罩 */
.login-mask {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 40rpx;
  background: #fbf7ec;
  border: 2rpx dashed #e2d8c0;
  border-radius: 16rpx;
  margin-bottom: 24rpx;
}

.mask-icon {
  font-size: 60rpx;
  margin-bottom: 16rpx;
}

.mask-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #3a322c;
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
}

.mask-desc {
  font-size: 24rpx;
  color: #8a8278;
  margin-bottom: 32rpx;
  letter-spacing: 1rpx;
}

.mask-btn {
  padding: 20rpx 80rpx;
  background: #b03a2e;
  color: #f6f1e4;
  font-size: 28rpx;
  border-radius: 44rpx;
  letter-spacing: 4rpx;
  box-shadow: 0 6rpx 14rpx rgba(176, 58, 46, 0.25);
  margin-bottom: 20rpx;
}

.mask-btn:active {
  opacity: 0.85;
}

.mask-sub {
  font-size: 24rpx;
  color: #8a8278;
  letter-spacing: 1rpx;
  text-decoration: underline;
}

.mask-sub:active {
  opacity: 0.6;
}

/* 答案 */
.answer-highlight {
  display: inline-block;
  padding: 12rpx 32rpx;
  font-size: 36rpx;
  font-weight: 700;
  color: #4e6e58;
  background: #eef5ee;
  border: 2rpx solid #4e6e58;
  border-radius: 12rpx;
  letter-spacing: 4rpx;
}

/* 解析 */
.analysis-content {
  font-size: 28rpx;
  color: #5c5348;
  line-height: 1.7;
  white-space: pre-wrap;
}

.platform-analysis {
  margin-top: 20rpx;
  padding: 16rpx;
  background: #f4ecdc;
  border-radius: 10rpx;
}

.platform-tag {
  display: inline-block;
  padding: 2rpx 14rpx;
  font-size: 22rpx;
  color: #b03a2e;
  background: #fff;
  border: 1rpx solid #b03a2e;
  border-radius: 16rpx;
  margin-bottom: 8rpx;
}

.platform-content {
  font-size: 26rpx;
  color: #5c5348;
  line-height: 1.7;
  white-space: pre-wrap;
}

.platform-image {
  width: 100%;
  margin-top: 8rpx;
  border-radius: 8rpx;
  background: #fff;
}

.empty {
  font-size: 24rpx;
  color: #8a8278;
  text-align: center;
  padding: 20rpx 0;
}

.bottom-space {
  height: 60rpx;
}
</style>