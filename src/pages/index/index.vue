<template>
  <view class="page">
    <!-- 全屏背景图 -->
    <image class="bg" src="/static/images/background-home.jpg" mode="aspectFill"></image>

    <!-- 状态栏占位 -->
    <view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

    <!-- 功能入口：2 列 x 2 行 -->
    <view class="grid">
      <view
        v-for="item in features"
        :key="item.key"
        class="grid-item"
        @tap="onTapFeature(item.key)"
      >
        <image class="feature-icon" :src="item.icon" mode="aspectFit"></image>
        <text class="feature-label">{{ item.label }}</text>
        <text class="feature-desc">{{ item.desc }}</text>
      </view>
    </view>

    <!-- 底部 CTA -->
    <view class="cta" @tap="onStart">
      <text class="cta-text">开始今日练习</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Index',
  data() {
    return {
      statusBarHeight: 20,
      features: [
        {
          key: 'space',
          label: '空间推理',
          desc: '折纸盒 / 立体拼合',
          icon: '/static/images/icons/icon-space-reasoning.png'
        },
        {
          key: 'three-view',
          label: '三视图',
          desc: '主俯侧 · 视图还原',
          icon: '/static/images/icons/icon-three-view.png'
        },
        {
          key: 'pattern',
          label: '规律训练',
          desc: '平移旋转 · 黑白运算',
          icon: '/static/images/icons/icon-pattern-training.png'
        },
        {
          key: 'wrong',
          label: '错题复盘',
          desc: '薄弱点专项突破',
          icon: '/static/images/icons/icon-wrong-answers.png'
        }
      ]
    };
  },
  onLoad() {
    try {
      const sys = uni.getSystemInfoSync();
      this.statusBarHeight = sys.statusBarHeight || 20;
    } catch (e) {}
  },
  methods: {
    onTapFeature(key) {
      const routeMap = {
        space: '/src/pages/space/index',
        'three-view': '/src/pages/three-view/index',
        pattern: '/src/pages/pattern/index',
        wrong: '/src/pages/wrong/index'
      };
      const url = routeMap[key];
      if (url) {
        uni.navigateTo({
          url,
          fail: () => uni.showToast({ title: '页面开发中', icon: 'none' })
        });
      }
    },
    onStart() {
      uni.navigateTo({
        url: '/src/pages/practice/index',
        fail: () => uni.showToast({ title: '开始练习开发中', icon: 'none' })
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

.grid {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 120rpx 40rpx 0;
  box-sizing: border-box;
}

.grid-item {
  width: 300rpx;
  margin-bottom: 40rpx;
  padding: 30rpx 20rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20rpx);
  -webkit-backdrop-filter: blur(20rpx);
  border: 1rpx solid rgba(255, 255, 255, 0.15);
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.96);
    background: rgba(255, 255, 255, 0.15);
  }
}

.feature-icon {
  width: 120rpx;
  height: 120rpx;
  border-radius: 24rpx;
  margin-bottom: 16rpx;
}

.feature-label {
  font-size: 30rpx;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.4;
}

.feature-desc {
  margin-top: 6rpx;
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
}

.cta {
  position: absolute;
  left: 40rpx;
  right: 40rpx;
  bottom: calc(60rpx + constant(safe-area-inset-bottom));
  bottom: calc(60rpx + env(safe-area-inset-bottom));
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
