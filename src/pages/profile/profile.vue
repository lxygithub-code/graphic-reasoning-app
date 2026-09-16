<template>
  <view class="profile-container">
    <view class="header">
      <u-avatar :src="userInfo?.avatar || '/static/avatar.png'" size="120"></u-avatar>
      <text class="name">{{ userInfo?.nickname || '用户' }}</text>
      <text class="time">总练习时长：{{ totalTime }} 秒</text>
    </view>
    <u-cell-group :border="false">
      <u-cell title="我的收藏" icon="star" @click="goPage('/pages/favorite/favorite')"></u-cell>
      <u-cell title="练习记录" icon="history" @click="goPage('/pages/history/history')"></u-cell>
    </u-cell-group>
  </view>
</template>

<script>
export default {
  data() {
    return {
      totalTime: 0
    }
  },
  computed: {
    userInfo() {
      return this.$store.state.userInfo || uni.getStorageSync('userInfo') || null
    }
  },
  onShow() {
    // 模拟获取总时长
    this.totalTime = this.userInfo?.totalPracticeTime || 3600
  },
  methods: {
    goPage(url) {
      uni.navigateTo({ url })
    }
  }
}
</script>

<style scoped>
.profile-container {
  min-height: 100vh;
  background: #f6f1e4;
  box-sizing: border-box;
}
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 70rpx 0 50rpx;
  margin: 24rpx;
  background: #fbf7ec;
  border: 1rpx solid #e2d8c0;
  border-radius: 20rpx;
  box-shadow: 0 6rpx 18rpx rgba(90, 78, 58, 0.08);
}
.name {
  font-size: 40rpx;
  font-weight: 700;
  color: #3a322c;
  margin: 20rpx 0 10rpx;
}
.time {
  font-size: 28rpx;
  color: #8a8278;
}
</style>
