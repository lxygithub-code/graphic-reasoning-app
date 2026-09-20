<template>
  <view class="history-container">
    <view v-if="!loading && !list.length" class="empty">暂无答题记录</view>

    <view v-for="item in list" :key="item.id" class="record-card" @click="goDetail(item)">
      <view class="record-head">
        <text class="record-title">{{ item.examTypeLabel || item.examType || '练习' }}</text>
        <text class="record-time">{{ item.createTime }}</text>
      </view>

      <view class="record-stat">
        <view class="stat-item">
          <text class="stat-num">{{ item.correctCount }}/{{ item.totalCount }}</text>
          <text class="stat-label">正确题数</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ item.accuracy }}%</text>
          <text class="stat-label">正确率</text>
        </view>
        <view class="stat-item">
          <text class="stat-num">{{ item.totalDuration }}s</text>
          <text class="stat-label">总耗时</text>
        </view>
      </view>
    </view>

    <view v-if="loading" class="loading">加载中...</view>
    <view v-else-if="noMore && list.length" class="no-more">没有更多了</view>
  </view>
</template>

<script>
import { listMyRecords } from '@/api/practice'

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
  onLoad() {
    this.loadData()
  },
  onReachBottom() {
    if (!this.noMore && !this.loading) {
      this.pageNum++
      this.loadData()
    }
  },
  methods: {
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await listMyRecords(this.pageNum, this.pageSize)
        const records = res.records || []
        if (this.pageNum === 1) {
          this.list = records
        } else {
          this.list = this.list.concat(records)
        }
        if (this.list.length >= res.total) {
          this.noMore = true
        }
      } catch (e) {
      } finally {
        this.loading = false
      }
    },

    goDetail(item) {
      uni.navigateTo({ url: `/pages/result/detail?recordId=${item.id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.history-container {
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

.record-card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.record-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.record-title {
  font-size: 30rpx;
  color: #3a322c;
  font-weight: 700;
}

.record-time {
  font-size: 22rpx;
  color: #8a8278;
}

.record-stat {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-num {
  font-size: 32rpx;
  color: #3a322c;
  font-weight: 700;
}

.stat-label {
  font-size: 22rpx;
  color: #8a8278;
  margin-top: 6rpx;
}
</style>