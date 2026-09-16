<template>
  <view class="profile-container">
    <view class="header">
      <u-avatar :src="userInfo?.avatar || '/static/avatar.png'" size="120"></u-avatar>
      <text class="name">{{ userInfo?.nickname || '用户' }}</text>
      <text class="time">总练习时长：{{ totalTime }} 秒</text>
    </view>
    <u-cell-group>
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
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0;
  background: white;
}
.name {
  font-size: 40rpx;
  font-weight: bold;
  margin: 20rpx 0 10rpx;
}
.time {
  font-size: 28rpx;
  color: #666;
}
</style>