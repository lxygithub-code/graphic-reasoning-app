<template>
  <view class="wrong-container">
    <view v-if="!loading && !list.length" class="empty">暂无错题，继续保持~</view>

    <view v-for="item in list" :key="item.id" class="wrong-card">
      <view class="wrong-content">{{ item.content }}</view>

      <image
        v-if="item.imageUrl"
        :src="picUrl(item.imageUrl)"
        class="wrong-image"
        mode="widthFix"
        referrer-policy="no-referrer"
      />

      <view class="wrong-meta">
        <text v-if="item.source" class="meta-tag">{{ item.source }}</text>
        <text v-if="item.category" class="meta-tag">{{ item.category }}</text>
      </view>

      <view class="wrong-actions">
        <view class="action-btn primary" @click="goDetail(item.id)">查看详情</view>
        <view class="action-btn" @click="remove(item)">移出错题</view>
      </view>
    </view>

    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="noMore && list.length" class="no-more">没有更多了</view>
  </view>
</template>

<script>
import { listWrong, removeWrong } from '@/api/wrong'
import { picUrl } from '@/utils/request'

export default {
  data() {
    return {
      list: [],
      pageNum: 1,
      pageSize: 10,
      loading: false,
      noMore: false
    }
  },
  onShow() {
    this.pageNum = 1
    this.noMore = false
    this.list = []
    this.loadData()
  },
  onReachBottom() {
    if (!this.noMore && !this.loading) {
      this.pageNum++
      this.loadData()
    }
  },
  methods: {
    picUrl,

    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await listWrong(this.pageNum, this.pageSize)
        const records = res.records || []
        this.list = this.pageNum === 1 ? records : this.list.concat(records)
        if (this.list.length >= res.total) this.noMore = true
      } catch (e) {
      } finally {
        this.loading = false
      }
    },

    goDetail(questionId) {
      uni.navigateTo({
        url: `/pages/wrong/detail?questionId=${questionId}`
      })
    },

    async remove(item) {
      uni.showModal({
        title: '提示',
        content: '确定移出错题本吗？',
        success: async (res) => {
          if (!res.confirm) return
          try {
            await removeWrong(item.id)
            uni.showToast({ title: '已移除', icon: 'success' })
            this.list = this.list.filter(i => i.id !== item.id)
          } catch (e) {}
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrong-container {
  min-height: 100vh;
  padding: 30rpx;
  background: #f6f1e4;
  box-sizing: border-box;
}

.empty,
.loading,
.no-more {
  text-align: center;
  font-size: 26rpx;
  color: #8a8278;
  padding: 60rpx 0;
}

.wrong-card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-left: 6rpx solid #b03a2e;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.wrong-content {
  font-size: 28rpx;
  color: #3a322c;
  line-height: 1.7;
  margin-bottom: 16rpx;
}

.wrong-image {
  width: 100%;
  margin-bottom: 16rpx;
  border-radius: 8rpx;
  background: #fff;
}

.wrong-meta {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.meta-tag {
  padding: 2rpx 12rpx;
  font-size: 22rpx;
  color: #8a8278;
  background: #f6f1e4;
  border-radius: 16rpx;
}

.wrong-actions {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  flex: 1;
  padding: 16rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: #3a322c;
  background: #f6f1e4;
  border-radius: 32rpx;
  border: 1rpx solid #e2d8c0;
}

.action-btn.primary {
  background: #b03a2e;
  color: #f6f1e4;
  border-color: #b03a2e;
}
</style>