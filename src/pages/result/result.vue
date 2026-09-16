<template>
  <view class="result-container">
    <u-icon name="checkmark-circle" color="#19be6b" size="100"></u-icon>
    <view class="score">正确率：{{ correct }} / {{ total }}</view>
    <view class="time">用时：{{ time }} 秒</view>
    <u-button type="primary" @click="goHome">返回首页</u-button>
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

<style scoped>
.result-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 70vh;
}
.score {
  font-size: 48rpx;
  font-weight: bold;
  margin: 30rpx 0;
}
.time {
  font-size: 32rpx;
  color: #666;
  margin-bottom: 50rpx;
}
</style>