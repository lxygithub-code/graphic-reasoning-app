<template>
  <view class="history-container">
    <u-list>
      <u-list-item v-for="(item, idx) in list" :key="idx">
        <view class="item">
          <text>日期：{{ item.date }}</text>
          <text>正确：{{ item.correct }}/{{ item.total }}</text>
          <text>用时：{{ item.time }}s</text>
        </view>
      </u-list-item>
    </u-list>
    <u-empty v-if="list.length === 0" text="暂无记录"></u-empty>
  </view>
</template>

<script>
import request from '@/utils/request.js'
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
.item {
  display: flex;
  justify-content: space-around;
  padding: 20rpx;
  border-bottom: 1px solid #eee;
  font-size: 28rpx;
}
</style>