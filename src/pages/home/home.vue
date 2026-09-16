<template>
  <view class="page">
    <!-- 全屏背景图 -->
    <image class="bg" src="/static/images/background-home.jpg" mode="aspectFill"></image>

    <!-- 自定义导航栏：返回 + 标题 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-inner">
        <view class="back" @tap="onBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="navbar-title">图推达人</text>
        <view class="back-placeholder"></view>
      </view>
    </view>

    <!-- 功能入口：2 列 x 2 行 -->
    <view class="grid">
      <view
        v-for="item in features"
        :key="item.key"
        class="grid-item"
        @tap="onTapFeature(item)"
      >
        <image class="feature-icon" :src="item.icon" mode="aspectFit"></image>
        <text class="feature-label">{{ item.label }}</text>
        <text class="feature-desc">{{ item.desc }}</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      statusBarHeight: 20,
      features: [
        {
          key: 'space',
          label: '空间推理',
          desc: '折纸盒 / 立体拼合',
          icon: '/static/images/icons/icon-space-reasoning.png',
          url: '/pages/practice/practice?mode=0&category=space'
        },
        {
          key: 'three-view',
          label: '三视图',
          desc: '主俯侧 · 视图还原',
          icon: '/static/images/icons/icon-three-view.png',
          url: '/pages/practice/practice?mode=0&category=three-view'
        },
        {
          key: 'pattern',
          label: '规律训练',
          desc: '平移旋转 · 黑白运算',
          icon: '/static/images/icons/icon-pattern-training.png',
          url: '/pages/practice/practice?mode=0&category=pattern'
        },
        {
          key: 'wrong',
          label: '错题复盘',
          desc: '薄弱点专项突破',
          icon: '/static/images/icons/icon-wrong-answers.png',
          url: '/pages/history/history'
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
    onBack() {
      uni.navigateBack({ delta: 1 });
    },
    onTapFeature(item) {
      uni.navigateTo({
        url: item.url,
        fail: (err) => {
          console.error('navigateTo fail:', err);
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

/* 自定义导航栏 */
.navbar {
  position: relative;
  z-index: 3;
}

.navbar-inner {
  height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24rpx;
}

.back {
  width: 64rpx;
  height: 64rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-arrow {
  color: #ffffff;
  font-size: 56rpx;
  font-weight: 300;
  line-height: 1;
}

.navbar-title {
  color: #ffffff;
  font-size: 34rpx;
  font-weight: 600;
}

.back-placeholder {
  width: 64rpx;
}

/* 功能入口网格 */
.grid {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 80rpx 40rpx 0;
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
</style>
