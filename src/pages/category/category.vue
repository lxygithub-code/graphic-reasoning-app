<template>
  <view class="category-container">
    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="!tree.length" class="empty">暂无分类</view>

    <view v-else class="tree-list">
      <CategoryNode
        v-for="node in tree"
        :key="node.dictValue"
        :node="node"
        :level="1"
      />
    </view>

    <view class="footer-tip">点击节点名展开子类 · 点「练习」进入背题模式</view>
  </view>
</template>

<script>
import request from '@/utils/request'

export default {
  data() {
    return {
      tree: [],
      loading: false
    }
  },
  onLoad() {
    this.loadTree()
  },
  methods: {
    async loadTree() {
      this.loading = true
      try {
        const res = await request({
          url: '/api/question/category-tree',
          method: 'GET'
        })
        this.tree = res || []
      } catch (e) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.category-container {
  min-height: 100vh;
  padding: 30rpx;
  background: #f6f1e4;
  box-sizing: border-box;
}

.loading,
.empty {
  text-align: center;
  font-size: 26rpx;
  color: #8a8278;
  padding: 100rpx 0;
}

.tree-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.footer-tip {
  margin-top: 40rpx;
  text-align: center;
  font-size: 22rpx;
  color: #b3a98f;
  letter-spacing: 4rpx;
}
</style>