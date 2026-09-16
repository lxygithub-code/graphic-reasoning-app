<template>
  <view class="page">
    <!-- 全屏背景图 -->
    <image class="bg" src="/static/images/background-home.jpg" mode="aspectFill"></image>

    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 品牌区 -->
    <view class="brand">
      <text class="brand-title">图推达人</text>
    </view>

    <!-- 底部 CTA：进入功能主页 -->
    <view class="cta" @tap="onStart">
      <text class="cta-text">开启今日练习</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      statusBarHeight: 20
    };
  },
  onLoad() {
    try {
      const sys = uni.getSystemInfoSync();
      this.statusBarHeight = sys.statusBarHeight || 20;
    } catch (e) {}
  },
  methods: {
    onStart() {
      uni.navigateTo({
        url: '/pages/home/home',
        fail: (err) => {
          console.error('navigateTo home fail:', err);
          uni.showToast({ title: '页面开发中', icon: 'none' });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.page {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: #0a1f3d;
}

.bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.status-bar {
  position: relative;
  z-index: 2;
}

.brand {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding-top: 200rpx;
}

.brand-title {
  font-size: 72rpx;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 8rpx;
}

.cta {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: calc(20rpx + constant(safe-area-inset-bottom));
  bottom: calc(20rpx + env(safe-area-inset-bottom));
  z-index: 2;
  height: 96rpx;
  border-radius: 48rpx;
  background: linear-gradient(135deg, #4fd1c5 0%, #2c7a7b 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(79, 209, 197, 0.35);

  &:active {
    opacity: 0.85;
  }
}

.cta-text {
  color: #ffffff;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
}
</style>
