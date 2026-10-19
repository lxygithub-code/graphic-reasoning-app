<template>
  <view class="feedback-detail-container">
    <view v-if="loading" class="loading">加载中...</view>
    
    <view v-else-if="data" class="content-wrapper">
      
      <!-- 状态条 -->
      <view class="status-header">
        <view class="status-tag" :class="'tag-' + statusClass(data.status)">
          <text class="status-icon">{{ statusIcon(data.status) }}</text>
          <text class="status-text">{{ statusText(data.status) }}</text>
        </view>
        <text class="submit-time">{{ formatTime(data.createTime) }} 提交</text>
      </view>

      <!-- 我的反馈 -->
      <view class="card my-feedback">
        <view class="card-label">我的意见</view>
        <view class="feedback-text">{{ data.content }}</view>
      </view>

      <!-- 官方回复 (仅在已解决时显示) -->
      <view v-if="data.status === 2 && data.replyContent" class="reply-section">
        <!-- 连接线 -->
        <view class="timeline-connector">
          <view class="line"></view>
        </view>

        <view class="card official-reply">
          <view class="reply-header">
            <view class="admin-info">
              <view class="admin-avatar">{{ (data.replyAdminName || '管')[0] }}</view>
              <view class="admin-name">{{ data.replyAdminName || '管理员' }}</view>
              <view class="official-badge">官方</view>
            </view>
            <text class="reply-time">{{ formatTime(data.replyTime) }}</text>
          </view>
          <view class="reply-text">{{ data.replyContent }}</view>
        </view>
      </view>

      <!-- 其他状态的提示 -->
      <view v-else-if="data.status === 0" class="pending-status">
        <text class="icon">⏳</text>
        <text class="text">已收到您的意见，正在排队处理</text>
      </view>
      <view v-else-if="data.status === 1" class="processing-status">
        <text class="icon">💡</text>
        <text class="text">管理员正在认真查看您的建议...</text>
      </view>

    </view>
  </view>
</template>

<script>
import { getFeedbackDetail } from '@/api/feedback'

export default {
  data() {
    return {
      id: null,
      data: null,
      loading: false
    }
  },
  onLoad(options) {
    if (options.id) {
      this.id = options.id
      this.loadDetail()
    }
  },
  methods: {
    async loadDetail() {
      this.loading = true
      try {
        this.data = await getFeedbackDetail(this.id)
      } catch (e) {
      } finally {
        this.loading = false
      }
    },
    formatTime(t) {
      if (!t) return ''
      const s = String(t).replace('T', ' ')
      return s.slice(0, 16)
    },
    statusText(status) {
      if (status === 0) return '待处理'
      if (status === 1) return '处理中'
      if (status === 2) return '已解决'
      return '未知'
    },
    statusClass(status) {
      if (status === 0) return 'pending'
      if (status === 1) return 'processing'
      if (status === 2) return 'done'
      return 'pending'
    },
    statusIcon(status) {
      if (status === 0) return '🕒'
      if (status === 1) return '⚙️'
      if (status === 2) return '✓'
      return ''
    }
  }
}
</script>

<style lang="scss" scoped>
.feedback-detail-container {
  min-height: 100vh;
  background: #f6f1e4;
  padding: 30rpx;
  box-sizing: border-box;
}

.loading {
  text-align: center;
  font-size: 26rpx;
  color: #8a8278;
  padding: 100rpx 0;
}

.content-wrapper {
  animation: fade-in 0.3s ease;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(10rpx); }
  to { opacity: 1; transform: translateY(0); }
}

/* ============ 顶部状态条 ============ */
.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
  padding: 0 10rpx;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 8rpx 20rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  font-weight: 600;
  letter-spacing: 1rpx;
}

.status-icon {
  font-size: 24rpx;
}

/* 状态颜色变体 */
.tag-pending {
  color: #b08d3a;
  background: #fdf3d9;
  border: 1rpx solid rgba(176, 141, 58, 0.3);
}
.tag-processing {
  color: #00a8ff;
  background: #e6f4ff;
  border: 1rpx solid rgba(0, 168, 255, 0.3);
}
.tag-done {
  color: #4e6e58;
  background: #eef5ee;
  border: 1rpx solid rgba(78, 110, 88, 0.3);
}

.submit-time {
  font-size: 22rpx;
  color: #b3a98f;
}

/* ============ 卡片通用样式 ============ */
.card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 6rpx 20rpx rgba(90, 78, 58, 0.04);
  position: relative;
  z-index: 2;
}

/* ============ 我的反馈 ============ */
.my-feedback {
  border-left: 8rpx solid #3a322c;
}

.card-label {
  font-size: 24rpx;
  color: #8a8278;
  margin-bottom: 16rpx;
  letter-spacing: 1rpx;
}

.feedback-text {
  font-size: 30rpx;
  color: #3a322c;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
}

/* ============ 连线动画 ============ */
.timeline-connector {
  display: flex;
  justify-content: center;
  height: 40rpx;
  position: relative;
  z-index: 1;
}

.line {
  width: 4rpx;
  height: 100%;
  background: dashed #d5c9b1;
  border-left: 2rpx dashed #d5c9b1;
}

/* ============ 官方回复 ============ */
.official-reply {
  border-left: 8rpx solid #4e6e58;
  background: linear-gradient(to bottom right, #fbf7ec, #f4f7f4);
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  margin-bottom: 20rpx;
  border-bottom: 1rpx dashed #e2d8c0;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.admin-avatar {
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, #4e6e58, #7ba889);
  color: #fff;
  font-size: 22rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-name {
  font-size: 26rpx;
  color: #3a322c;
  font-weight: 600;
}

.official-badge {
  font-size: 20rpx;
  color: #4e6e58;
  background: #eef5ee;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  border: 1rpx solid rgba(78, 110, 88, 0.3);
}

.reply-time {
  font-size: 22rpx;
  color: #b3a98f;
}

.reply-text {
  font-size: 30rpx;
  color: #3a322c;
  line-height: 1.6;
  word-break: break-all;
  white-space: pre-wrap;
}

/* ============ 待处理/处理中提示 ============ */
.pending-status,
.processing-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  gap: 20rpx;
}

.pending-status .icon,
.processing-status .icon {
  font-size: 64rpx;
  opacity: 0.6;
}

.pending-status .text,
.processing-status .text {
  font-size: 26rpx;
  color: #8a8278;
  letter-spacing: 2rpx;
}

.processing-status .text {
  color: #00a8ff;
}
</style>