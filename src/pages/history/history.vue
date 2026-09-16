<template>
  <view class="history-container">
    <u-list>
      <u-list-item v-for="(item, idx) in list" :key="idx">
        <view class="item">
          <text class="item-date">{{ item.date }}</text>
          <text class="item-correct">正确 {{ item.correct }}/{{ item.total }}</text>
          <text class="item-time">{{ item.time }}s</text>
        </view>
      </u-list-item>
    </u-list>
    <u-empty v-if="list.length === 0" text="暂无记录"></u-empty>
  </view>
</template>

<script>
import request from '@/utils/request'
export default {
  data() {
    return {
      list: []
    }
  },
  onShow() {
    this.loadHistory()
  },
  methods: {
    async loadHistory() {
      const data = await request({ url: '/practice/history' })
      this.list = data
    }
  }
}
</script>

<style scoped>
.history-container {
  min-height: 100vh;
  background: #f6f1e4;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
}
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 28rpx 24rpx;
  margin-bottom: 20rpx;
  background: #fbf7ec;
  border: 1rpx solid #e2d8c0;
  border-radius: 14rpx;
}
.item-date {
  font-size: 28rpx;
  color: #3a322c;
}
.item-correct {
  font-size: 28rpx;
  color: #4e6e58;
  font-weight: 600;
}
.item-time {
  font-size: 26rpx;
  color: #8a8278;
}
</style>
