<template>
  <view class="wrong-detail-container" v-if="data.questionId">
    <!-- 头部信息 -->
    <view class="head-card">
      <view class="head-row">
        <text class="card-tag">错 {{ data.wrongCount || 1 }} 次</text>
        <text class="head-time">{{ data.answerTime }}</text>
      </view>
      <view class="head-meta">
        <text v-if="data.source" class="meta-tag">{{ data.source }}</text>
        <text v-if="data.category" class="meta-tag">{{ data.category }}</text>
        <text v-if="data.duration" class="meta-tag">耗时 {{ data.duration }}s</text>
      </view>
    </view>

    <!-- 题干 -->
    <view class="card">
      <view class="card-title">题目</view>
      <view class="question-content">{{ data.content }}</view>
      <image
        v-if="data.imageUrl"
        :src="picUrl(data.imageUrl)"
        class="question-image"
        mode="widthFix"
        referrer-policy="no-referrer"
        @click="previewImage(picUrl(data.imageUrl))"
      />
    </view>

    <!-- 选项 -->
    <view class="card">
      <view class="card-title">选项</view>
      <view class="options-list">
        <view
          v-for="(opt, idx) in data.options || []"
          :key="idx"
          class="option-item"
          :class="{
            correct: opt.key === data.correctOption,
            wrong: opt.key === data.userOption && opt.key !== data.correctOption
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
          <text v-if="opt.key === data.correctOption" class="opt-mark">✓ 正确答案</text>
          <text
            v-if="opt.key === data.userOption && opt.key !== data.correctOption"
            class="opt-mark wrong-mark"
          >✗ 你的选择</text>
        </view>
      </view>
    </view>

    <!-- 解析 -->
    <view class="card">
      <view class="card-title">解析</view>

      <view v-if="data.analysis" class="analysis-content">{{ data.analysis }}</view>

      <view
        v-for="(a, ai) in data.analyses || []"
        :key="ai"
        class="platform-analysis"
      >
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

      <view v-if="!data.analysis && (!data.analyses || !data.analyses.length)" class="empty">
        暂无解析
      </view>
    </view>

    <!-- 底部按钮 -->
    <view class="btn-row">
      <view class="ink-btn ink-btn-ghost" @click="removeWrong">移出错题</view>
      <view class="ink-btn ink-btn-primary" @click="goPractice">同类型题练习</view>
    </view>

    <view class="bottom-space"></view>
  </view>

  <view v-else-if="loading" class="loading">加载中...</view>
</template>

<script>
import { getWrongDetail, removeWrong } from '@/api/wrong'
import { listDict } from '@/api/dict'
import { picUrl } from '@/utils/request'

export default {
  data() {
    return {
      questionId: null,
      data: {
        questionId: null,
        content: '',
        imageUrl: '',
        options: [],
        correctOption: '',
        analysis: '',
        analyses: [],
        wrongCount: 0,
        lastWrongTime: '',
        userOption: '',
        duration: 0,
        answerTime: '',
        source: '',
        category: ''
      },
      platformOptions: [],
      loading: false
    }
  },
  onLoad(options) {
    this.questionId = options.questionId
    this.loadPlatformOptions()
    this.loadDetail()
  },
  methods: {
    picUrl,

    async loadDetail() {
      this.loading = true
      try {
        const res = await getWrongDetail(this.questionId)
        this.data = res || this.data
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
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

    async removeWrong() {
      uni.showModal({
        title: '提示',
        content: '确定移出错题本吗？',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await removeWrong(this.questionId)
            uni.showToast({ title: '已移除', icon: 'success' })
            setTimeout(() => uni.navigateBack(), 800)
          } catch (e) {}
        }
      })
    },

    goPractice() {
      uni.showToast({ title: '功能建设中', icon: 'warn' })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrong-detail-container {
  min-height: 100vh;
  padding: 30rpx;
  background: #f6f1e4;
  box-sizing: border-box;
}

.loading {
  text-align: center;
  font-size: 26rpx;
  color: #8a8278;
  padding: 100rpx 0;
}

/* 头部信息 */
.head-card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-left: 6rpx solid #b03a2e;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
}

.head-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.card-tag {
  padding: 4rpx 16rpx;
  font-size: 24rpx;
  color: #fff;
  background: #b03a2e;
  border-radius: 20rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}

.head-time {
  font-size: 22rpx;
  color: #8a8278;
}

.head-meta {
  display: flex;
  gap: 12rpx;
  flex-wrap: wrap;
}

.meta-tag {
  padding: 2rpx 12rpx;
  font-size: 22rpx;
  color: #8a8278;
  background: #f6f1e4;
  border-radius: 16rpx;
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

.option-item.wrong {
  background: #f9e8e4;
  border-color: #b03a2e;
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

.wrong-mark {
  color: #b03a2e;
}

/* 解析 */
.analysis-content {
  font-size: 28rpx;
  color: #5c5348;
  line-height: 1.7;
  white-space: pre-wrap;
}

.empty {
  font-size: 24rpx;
  color: #8a8278;
  text-align: center;
  padding: 20rpx 0;
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

/* 底部按钮 */
.btn-row {
  display: flex;
  gap: 24rpx;
  margin-top: 30rpx;
}

.ink-btn {
  flex: 1;
  padding: 22rpx 0;
  border-radius: 44rpx;
  background: #3a322c;
  color: #f6f1e4;
  font-size: 28rpx;
  letter-spacing: 2rpx;
  text-align: center;
  box-shadow: 0 6rpx 14rpx rgba(58, 50, 44, 0.2);
}

.ink-btn:active {
  opacity: 0.85;
}

.ink-btn-primary {
  background: #b03a2e;
  box-shadow: 0 6rpx 14rpx rgba(176, 58, 46, 0.25);
}

.ink-btn-ghost {
  background: transparent;
  color: #3a322c;
  border: 2rpx solid #3a322c;
  box-shadow: none;
}

.bottom-space {
  height: 60rpx;
}
</style>