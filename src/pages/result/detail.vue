<template>
  <view class="detail-container">
    <!-- 汇总 -->
    <view class="summary-card">
      <view class="summary-seal">录</view>
      <view class="summary-stat">
        <view class="stat-item">
          <text class="stat-num">{{ data.correctCount }} / {{ data.totalCount }}</text>
          <text class="stat-label">正确题数</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ data.accuracy }}%</text>
          <text class="stat-label">正确率</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ data.totalDuration }}s</text>
          <text class="stat-label">总耗时</text>
        </view>
      </view>
      <view class="summary-time">{{ data.createTime }}</view>
    </view>

    <!-- 题目列表 -->
    <view class="question-list">
      <view
        v-for="(item, idx) in data.items"
        :key="idx"
        class="question-card"
        :class="item.isCorrect ? 'card-ok' : 'card-no'"
      >
        <view class="card-head">
          <view class="card-index">
            第 {{ idx + 1 }} 题
            <text class="card-tag" :class="item.isCorrect ? 'tag-ok' : 'tag-no'">
              {{ item.isCorrect ? '✓ 正确' : '✗ 错误' }}
            </text>
          </view>
          <text class="card-time">耗时 {{ item.duration }}s</text>
        </view>

        <view class="card-content">{{ item.content }}</view>

        <image
          v-if="item.imageUrl"
          :src="fullUrl(item.imageUrl)"
          class="card-image"
          mode="widthFix"
          @click="previewImage(fullUrl(item.imageUrl))"
        />

        <view class="card-options">
          <view
            v-for="(opt, oi) in item.options"
            :key="oi"
            class="card-option"
            :class="{
              correct: opt.key === item.correctOption,
              wrong: opt.key === item.userOption && !item.isCorrect
            }"
          >
            <text class="opt-key">{{ opt.key }}.</text>
            <text v-if="opt.type === 'text'" class="opt-text">{{ opt.value }}</text>
            <image
              v-else
              :src="fullUrl(opt.value)"
              class="opt-image"
              mode="widthFix"
              @click.stop="previewImage(fullUrl(opt.value))"
            />
            <text v-if="opt.key === item.correctOption" class="opt-mark">✓</text>
            <text v-if="opt.key === item.userOption && !item.isCorrect" class="opt-mark wrong-mark">✗</text>
          </view>
        </view>

        <view v-if="item.analysis" class="card-analysis">
          <view class="analysis-title">解析</view>
          <view class="analysis-content">{{ item.analysis }}</view>
        </view>
      </view>
    </view>

    <view class="bottom-space"></view>
  </view>
</template>

<script>
import { getRecordDetail } from '@/api/practice'

export default {
  data() {
    return {
      recordId: null,
      data: {
        recordId: null,
        totalCount: 0,
        correctCount: 0,
        accuracy: 0,
        totalDuration: 0,
        createTime: '',
        items: []
      }
    }
  },
  onLoad(options) {
    this.recordId = options.recordId
    this.loadDetail()
  },
  methods: {
    async loadDetail() {
      try {
        uni.showLoading({ title: '加载中...' })
        const res = await getRecordDetail(this.recordId)
        this.data = res || this.data
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    },
    fullUrl(u) {
      if (!u) return ''
      return u.startsWith('http') ? u : 'http://192.168.0.146:8866' + u
    },
    previewImage(url) {
      if (!url) return
      uni.previewImage({ urls: [url] })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  padding: 30rpx;
  background: #f6f1e4;
  box-sizing: border-box;
}

.summary-card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-radius: 20rpx;
  padding: 30rpx 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30rpx;
}
.summary-seal {
  width: 80rpx;
  height: 80rpx;
  border: 3rpx solid #b03a2e;
  border-radius: 12rpx;
  color: #b03a2e;
  font-size: 40rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-6deg);
  margin-bottom: 20rpx;
}
.summary-stat {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 16rpx;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 36rpx;
  color: #3a322c;
  font-weight: 700;
}
.stat-label {
  font-size: 22rpx;
  color: #8a8278;
  margin-top: 6rpx;
}
.summary-time {
  font-size: 22rpx;
  color: #8a8278;
}

.question-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}
.question-card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-radius: 16rpx;
  padding: 24rpx;
}
.card-ok {
  border-left: 6rpx solid #4e6e58;
}
.card-no {
  border-left: 6rpx solid #b03a2e;
}
.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}
.card-index {
  font-size: 26rpx;
  color: #3a322c;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 12rpx;
}
.card-tag {
  font-size: 22rpx;
  font-weight: 700;
}
.tag-ok { color: #4e6e58; }
.tag-no { color: #b03a2e; }
.card-time {
  font-size: 22rpx;
  color: #8a8278;
}
.card-content {
  font-size: 28rpx;
  color: #3a322c;
  line-height: 1.7;
  margin-bottom: 16rpx;
}
.card-image {
  width: 100%;
  margin-bottom: 16rpx;
  border-radius: 8rpx;
  background: #fff;
}

.card-options {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}
.card-option {
  display: flex;
  align-items: center;
  padding: 14rpx 18rpx;
  background: #f6f1e4;
  border-radius: 10rpx;
  font-size: 26rpx;
}
.card-option.correct {
  background: #eef5ee;
  border: 1rpx solid #4e6e58;
}
.card-option.wrong {
  background: #f9e8e4;
  border: 1rpx solid #b03a2e;
}
.opt-key {
  font-weight: 700;
  margin-right: 10rpx;
  color: #3a322c;
  flex-shrink: 0;
}
.opt-text {
  flex: 1;
  color: #4a4238;
  line-height: 1.6;
}
.opt-image {
  flex: 1;
  max-width: 320rpx;
  border-radius: 6rpx;
}
.opt-mark {
  color: #4e6e58;
  font-weight: 700;
  margin-left: 10rpx;
}
.wrong-mark {
  color: #b03a2e;
}

.card-analysis {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f4ecdc;
  border-radius: 10rpx;
}
.analysis-title {
  font-size: 24rpx;
  font-weight: 700;
  color: #3a322c;
  margin-bottom: 8rpx;
}
.analysis-content {
  font-size: 26rpx;
  color: #5c5348;
  line-height: 1.7;
}

.bottom-space {
  height: 60rpx;
}
</style>