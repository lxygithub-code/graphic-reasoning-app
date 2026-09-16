<template>
  <view class="page">
    <!-- 水墨装饰：淡墨晕染 -->
    <view class="ink-orb orb-1"></view>
    <view class="ink-orb orb-2"></view>
    <view class="ink-mountain"></view>

    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 品牌区 -->
    <view class="brand">
      <view class="brand-seal">图</view>
      <text class="brand-title">图推达人</text>
    </view>
    <view class="subtitle">
      <view class="subtitle-line"></view>
      <text class="subtitle-text">图形推理 · 每日精进</text>
      <view class="subtitle-line"></view>
    </view>

    <!-- 底部 CTA：进入功能主页 -->
    <view class="cta" @tap="onStart">
      <text class="cta-text">开启今日练习</text>
      <view class="cta-seal"></view>
    </view>

    <!-- 页脚题字 -->
    <view class="footer">
      <text class="footer-text">每日一练 · 持之以恒</text>
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
/* ===== 水墨配色 =====
 * 宣纸底 #f6f1e4 / 墨色 #3a322c / 浅墨 #8a8278 / 朱砂印 #b03a2e
 */
.page {
  position: relative;
  width: 100vw;
  min-height: 100vh;
  overflow: hidden;
  background: #f6f1e4;
  box-sizing: border-box;
}

/* 淡墨晕染装饰 */
.ink-orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.orb-1 {
  top: -140rpx;
  right: -160rpx;
  width: 500rpx;
  height: 500rpx;
  background: radial-gradient(circle, rgba(122, 108, 88, 0.12) 0%, rgba(122, 108, 88, 0) 70%);
}

.orb-2 {
  bottom: 260rpx;
  left: -180rpx;
  width: 460rpx;
  height: 460rpx;
  background: radial-gradient(circle, rgba(122, 108, 88, 0.10) 0%, rgba(122, 108, 88, 0) 70%);
}

/* 底部远山淡墨线 */
.ink-mountain {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 120rpx;
  height: 200rpx;
  background:
    radial-gradient(ellipse at 20% 100%, rgba(90, 78, 58, 0.10) 0%, rgba(90, 78, 58, 0) 60%),
    radial-gradient(ellipse at 75% 100%, rgba(90, 78, 58, 0.12) 0%, rgba(90, 78, 58, 0) 55%);
  pointer-events: none;
}

.status-bar {
  position: relative;
  z-index: 2;
}

/* 品牌区 */
.brand {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 240rpx;
}

.brand-seal {
  width: 56rpx;
  height: 56rpx;
  border: 3rpx solid #b03a2e;
  border-radius: 8rpx;
  color: #b03a2e;
  font-size: 30rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: rotate(-6deg);
  margin-right: 20rpx;
}

.brand-title {
  font-size: 76rpx;
  font-weight: 700;
  color: #3a322c;
  letter-spacing: 10rpx;
}

/* 副标题 */
.subtitle {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 30rpx;
}

.subtitle-line {
  width: 48rpx;
  height: 2rpx;
  background: #c9bda3;
}

.subtitle-text {
  margin: 0 20rpx;
  font-size: 24rpx;
  color: #8a8278;
  letter-spacing: 6rpx;
}

/* 底部 CTA */
.cta {
  position: absolute;
  left: 90rpx;
  right: 90rpx;
  bottom: calc(200rpx + constant(safe-area-inset-bottom));
  bottom: calc(200rpx + env(safe-area-inset-bottom));
  z-index: 2;
  height: 100rpx;
  border-radius: 50rpx;
  background: #3a322c;
  box-shadow: 0 10rpx 28rpx rgba(58, 50, 44, 0.28);
  display: flex;
  align-items: center;
  justify-content: center;

  &:active {
    opacity: 0.85;
    transform: scale(0.98);
  }
}

.cta-text {
  color: #f6f1e4;
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 6rpx;
}

.cta-seal {
  position: absolute;
  right: 40rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
  background: #b03a2e;
}

/* 页脚题字 */
.footer {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(80rpx + constant(safe-area-inset-bottom));
  bottom: calc(80rpx + env(safe-area-inset-bottom));
  z-index: 2;
  display: flex;
  justify-content: center;
}

.footer-text {
  font-size: 22rpx;
  color: #b3a98f;
  letter-spacing: 6rpx;
}
</style>
