<template>
  <view class="page">
    <!-- 水墨装饰 -->
    <view class="ink-orb orb-1"></view>
    <view class="ink-orb orb-2"></view>

    <!-- 自定义导航栏 -->
    <view class="navbar" :style="{ paddingTop: statusBarHeight + 'px' }">
      <view class="navbar-inner">
        <view class="back" @tap="onBack">
          <text class="back-arrow">‹</text>
        </view>
        <view class="navbar-title-wrap">
          <text class="navbar-title">图推达人</text>
          <view class="seal"></view>
        </view>
        <view class="back-placeholder"></view>
      </view>
    </view>

    <!-- 副标题 -->
    <view class="subtitle">
      <view class="subtitle-line"></view>
      <text class="subtitle-text">图形推理 · 每日精进</text>
      <view class="subtitle-line"></view>
    </view>

    <!-- 功能模块 -->
    <view class="grid">
      <view
        v-for="item in features"
        :key="item.key"
        class="grid-item"
        @tap="onTapFeature(item)"
      >
        <image class="feature-icon" :src="item.icon" mode="aspectFit" referrer-policy="no-referrer"></image>
        <text class="feature-label">{{ item.label }}</text>
        <text class="feature-desc">
          {{ item.desc }} ·
          <text class="desc-count">{{ countText(item.key) }}</text>
        </text>
        <view class="item-seal"></view>
      </view>
    </view>

    <!-- 页脚题字 -->
    <view class="footer">
      <text class="footer-text">每日一练 · 持之以恒</text>
    </view>
  </view>
</template>

<script>
import { picUrl } from '@/utils/request'
import { countByExamType } from '@/api/question'

export default {
  name: 'Home',
  data() {
    return {
      statusBarHeight: 20,
      counts: {},          // { guokao: 60, shengkao: 0, ... }
      features: [
        {
          key: 'guokao',
          label: '国考专题',
          desc: '国考历年真题',
          icon: picUrl('icon-guokao.png'),
          url: '/pages/practice/practice?mode=0&examType=guokao'
        },
        {
          key: 'shengkao',
          label: '省考专题',
          desc: '省考历年真题',
          icon: picUrl('icon-shengkao.png'),
          url: '/pages/practice/practice?mode=0&examType=shengkao'
        },
        {
          key: 'shiye',
          label: '事业编专题',
          desc: '事业单位考试真题',
          icon: picUrl('icon-shiye.png'),
          url: '/pages/practice/practice?mode=0&examType=shiye'
        },
        {
          key: 'custom',
          label: '自定义刷题',
          desc: '混合组卷 · 自由练习',
          icon: picUrl('icon-custom.png'),
          url: '/pages/practice/practice?mode=0&examType=custom'
        }
      ]
    }
  },
  onLoad() {
    try {
      const sys = uni.getSystemInfoSync()
      this.statusBarHeight = sys.statusBarHeight || 20
    } catch (e) {}
  },
  onShow() {
    this.loadCounts()
  },
  methods: {
    async loadCounts() {
      try {
        const list = await countByExamType()
        const map = {}
        ;(list || []).forEach(item => {
          map[item.examType] = item.count
        })
        this.counts = map
      } catch (e) {
        console.warn('加载题库数量失败', e)
      }
    },

    // 根据 key 返回题库数量文字
    countText(key) {
      // 自定义刷题：显示全部题目总数
      if (key === 'custom') {
        const total = Object.values(this.counts).reduce((sum, n) => sum + (n || 0), 0)
        return total > 0 ? `${total} 题` : '-- 题'
      }
      const n = this.counts[key]
      return n != null ? `${n} 题` : '-- 题'
    },

    onTapFeature(item) {
      uni.navigateTo({ url: item.url })
    },

    onBack() {
      const pages = getCurrentPages()
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 })
      } else {
        uni.reLaunch({ url: '/pages/index/index' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/* ===== 水墨配色 =====
 * 宣纸底 #f6f1e4 / 卡片纸 #fbf7ec
 * 墨色 #3a322c / 浅墨 #8a8278 / 淡墨线 #e2d8c0
 * 朱砂印 #b03a2e
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
  top: -120rpx;
  right: -140rpx;
  width: 460rpx;
  height: 460rpx;
  background: radial-gradient(circle, rgba(122, 108, 88, 0.10) 0%, rgba(122, 108, 88, 0) 70%);
}

.orb-2 {
  bottom: 180rpx;
  left: -160rpx;
  width: 420rpx;
  height: 420rpx;
  background: radial-gradient(circle, rgba(122, 108, 88, 0.08) 0%, rgba(122, 108, 88, 0) 70%);
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
  color: #3a322c;
  font-size: 56rpx;
  font-weight: 300;
  line-height: 1;
}

.navbar-title-wrap {
  display: flex;
  align-items: center;
}

.navbar-title {
  color: #3a322c;
  font-size: 34rpx;
  font-weight: 700;
  letter-spacing: 4rpx;
}

.seal {
  margin-left: 12rpx;
  width: 16rpx;
  height: 16rpx;
  border-radius: 4rpx;
  background: #b03a2e;
}

.back-placeholder {
  width: 64rpx;
}

/* 副标题 */
.subtitle {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10rpx;
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

/* 功能模块网格 */
.grid {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 64rpx 40rpx 0;
  box-sizing: border-box;
}

.grid-item {
  position: relative;
  width: 300rpx;
  box-sizing: border-box;
  margin-bottom: 40rpx;
  padding: 40rpx 20rpx 32rpx;
  border-radius: 20rpx;
  background: #fbf7ec;
  border: 1rpx solid #e2d8c0;
  box-shadow: 0 6rpx 18rpx rgba(90, 78, 58, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.96);
    border-color: #c9bda3;
    box-shadow: 0 4rpx 12rpx rgba(90, 78, 58, 0.14);
  }
}

/* 卡片角落朱砂印点缀 */
.item-seal {
  position: absolute;
  top: 18rpx;
  right: 18rpx;
  width: 12rpx;
  height: 12rpx;
  border-radius: 3rpx;
  background: rgba(176, 58, 46, 0.85);
}

.feature-icon {
  width: 132rpx;
  height: 132rpx;
  border-radius: 20rpx;
  margin-bottom: 20rpx;
}

.feature-label {
  font-size: 32rpx;
  font-weight: 700;
  color: #3a322c;
  letter-spacing: 2rpx;
  line-height: 1.4;
}

.feature-desc {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #8a8278;
  letter-spacing: 1rpx;
  text-align: center;
  line-height: 1.5;
}

/* ★ 数量强调：朱砂红 + 加粗 */
.desc-count {
  color: #b03a2e;
  font-weight: 600;
  letter-spacing: 0;
}

/* 页脚题字 */
.footer {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: center;
  padding: 24rpx 0 60rpx;
}

.footer-text {
  font-size: 22rpx;
  color: #b3a98f;
  letter-spacing: 6rpx;
}
</style>