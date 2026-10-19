<template>
  <view class="submit-container">
    <view class="form-card">
      <view class="form-title">提出你的建议</view>
      <view class="form-desc">无论功能建议、使用体验、内容纠错，都欢迎告诉我们</view>

      <textarea
        v-model="content"
        class="feedback-textarea"
        placeholder="请详细描述你的意见或建议（不少于 5 个字）..."
        maxlength="1000"
        :disabled="submitting"
        auto-height
      />

      <view class="length-row">
        <text class="length-tip">{{ content.length }}/1000</text>
      </view>
    </view>

    <view class="btn-row">
      <view
        class="ink-btn ink-btn-primary"
        :class="{ disabled: !canSubmit || submitting }"
        @click="handleSubmit"
      >
        {{ submitting ? '提交中...' : '提交意见' }}
      </view>
    </view>

    <view class="footer-tip">提交后管理员会尽快查看，回复后会通知你</view>
  </view>
</template>

<script>
import { submitFeedback } from '@/api/feedback'

export default {
  data() {
    return {
      content: '',
      submitting: false
    }
  },

  computed: {
    canSubmit() {
      return this.content.trim().length >= 5
    }
  },

  methods: {
    async handleSubmit() {
      if (!this.canSubmit) {
        uni.showToast({ title: '至少输入 5 个字', icon: 'none' })
        return
      }
      if (this.submitting) return

      this.submitting = true
      try {
        await submitFeedback({
          content: this.content.trim()
        })

        uni.showToast({ title: '提交成功', icon: 'success' })
        setTimeout(() => {
          uni.navigateBack()
        }, 800)
      } catch (e) {
        // request 层已经 toast
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.submit-container {
  min-height: 100vh;
  padding: 30rpx;
  background: #f6f1e4;
  box-sizing: border-box;
}

.form-card {
  background: #fbf7ec;
  border: 2rpx solid #e2d8c0;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 40rpx;
}

.form-title {
  font-size: 32rpx;
  color: #3a322c;
  font-weight: 700;
  letter-spacing: 2rpx;
  margin-bottom: 12rpx;
}

.form-desc {
  font-size: 24rpx;
  color: #8a8278;
  line-height: 1.6;
  margin-bottom: 24rpx;
}

.feedback-textarea {
  width: 100%;
  min-height: 320rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #3a322c;
  background: #f6f1e4;
  border-radius: 12rpx;
  box-sizing: border-box;
  line-height: 1.7;
}

.length-row {
  display: flex;
  justify-content: flex-end;
  margin: 12rpx 0 24rpx;
}

.length-tip {
  font-size: 22rpx;
  color: #8a8278;
}

.btn-row {
  display: flex;
  justify-content: center;
}

.ink-btn {
  width: 400rpx;
  padding: 24rpx 0;
  border-radius: 50rpx;
  text-align: center;
  font-size: 30rpx;
  letter-spacing: 4rpx;
  color: #f6f1e4;
  background: #3a322c;
  box-shadow: 0 6rpx 14rpx rgba(58, 50, 44, 0.2);
}

.ink-btn:active {
  opacity: 0.85;
}

.ink-btn-primary {
  background: #b03a2e;
  box-shadow: 0 6rpx 14rpx rgba(176, 58, 46, 0.25);
}

.ink-btn.disabled {
  opacity: 0.5;
  pointer-events: none;
}

.footer-tip {
  margin-top: 40rpx;
  text-align: center;
  font-size: 22rpx;
  color: #b3a98f;
  letter-spacing: 2rpx;
}
</style>