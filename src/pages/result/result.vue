<template>
  <view class="result-container">
    <view class="result-seal">绩</view>

    <view class="score">
      正确率：{{ correct }} / {{ total }}
    </view>

    <view class="stat-row">
      <view class="stat-item">
        <text class="stat-num ok">{{ correct }}</text>
        <text class="stat-label">答对</text>
      </view>
      <view class="stat-item">
        <text class="stat-num no">{{ Math.max(total - correct, 0) }}</text>
        <text class="stat-label">答错</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">{{ accuracyText }}</text>
        <text class="stat-label">正确率</text>
      </view>
    </view>

    <view class="time">用时：{{ time }} 秒</view>

    <view class="btn-group">
      <view class="ink-btn" @click="goDetail">查看答题记录</view>
      <view class="ink-btn ink-btn-primary" @click="goHome">返回首页</view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      recordId: null,
      correct: 0,
      total: 0,
      time: 0
    }
  },
  computed: {
    accuracyText() {
      if (!this.total) return '0%'
      return Math.round((this.correct / this.total) * 100) + '%'
    }
  },
  onLoad(options) {
    this.recordId = options.recordId || null
    this.correct = parseInt(options.correct) || 0
    this.total = parseInt(options.total) || 0
    this.time = parseInt(options.time) || 0
  },
  methods: {
    goDetail() {
      if (!this.recordId) {
        uni.showToast({ title: '记录不存在', icon: 'none' })
        return
      }
      uni.navigateTo({
        url: `/pages/result/detail?recordId=${this.recordId}`
      })
    },
    goHome() {
      // 用 reLaunch 兜底，不管首页是不是 tabBar 页都能回
      uni.reLaunch({ url: '/pages/home/home' })
    }
  }
}
</script>

<style lang="scss" scoped>
.result-container {
  min-height: 100vh;
  background: #f6f1e4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 40rpx 0;
}

.result-seal {
  width: 120rpx;
  height: 120rpx;
  border: 4rpx solid #b03a2e;
  border-radius: 18rpx;
  color: #b03a2e;
  font-size: 56rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-6deg);
  box-shadow: 0 8rpx 20rpx rgba(176, 58, 46, 0.18);
}

.score {
  font-size: 48rpx;
  font-weight: 700;
  color: #3a322c;
  letter-spacing: 2rpx;
  margin: 40rpx 0 30rpx;
}

.stat-row {
  display: flex;
  gap: 60rpx;
  margin-bottom: 30rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 40rpx;
  font-weight: 700;
  color: #3a322c;
}

.stat-num.ok {
  color: #4e6e58;
}

.stat-num.no {
  color: #b03a2e;
}

.stat-label {
  font-size: 24rpx;
  color: #8a8278;
  margin-top: 6rpx;
}

.time {
  font-size: 30rpx;
  color: #8a8278;
  margin-bottom: 60rpx;
}

.btn-group {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  width: 100%;
  padding: 0 80rpx;
  box-sizing: border-box;
}

.ink-btn {
  width: 100%;
  padding: 24rpx 0;
  border-radius: 44rpx;
  background: #3a322c;
  color: #f6f1e4;
  font-size: 30rpx;
  letter-spacing: 4rpx;
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
</style>