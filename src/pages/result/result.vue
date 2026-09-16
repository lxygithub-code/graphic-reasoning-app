<template>
  <view class="result-container">
    <view class="result-seal">绩</view>
    <view class="score">正确率：{{ correct }} / {{ total }}</view>
    <view class="time">用时：{{ time }} 秒</view>
    <view class="ink-btn" @click="goHome">返回首页</view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      correct: 0,
      total: 0,
      time: 0
    }
  },
  onLoad(options) {
    this.correct = parseInt(options.correct) || 0
    this.total = parseInt(options.total) || 0
    this.time = parseInt(options.time) || 0
  },
  methods: {
    goHome() {
      uni.switchTab({ url: '/pages/index/index' })
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
  margin: 40rpx 0 20rpx;
}
.time {
  font-size: 30rpx;
  color: #8a8278;
  margin-bottom: 60rpx;
}
.ink-btn {
  min-width: 240rpx;
  padding: 22rpx 56rpx;
  border-radius: 44rpx;
  background: #3a322c;
  color: #f6f1e4;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  text-align: center;
  box-shadow: 0 6rpx 14rpx rgba(58, 50, 44, 0.2);

  &:active {
    opacity: 0.85;
  }
}
</style>
