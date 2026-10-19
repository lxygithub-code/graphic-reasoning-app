<template>
	<view class="feedback-container">
		<!-- 顶部提示 -->
		<view class="header-tip">
			<text class="tip-icon">💡</text>
			<text class="tip-text">你的每一条建议，都会被认真对待</text>
		</view>

		<!-- 空状态 -->
		<view v-if="!loading && !list.length" class="empty">
			<text class="empty-icon">📮</text>
			<text class="empty-text">还没有提交过意见</text>
			<text class="empty-tip">点击右下角按钮，来说两句</text>
		</view>

		<!-- 列表 -->
		<view v-for="item in list" :key="item.id" class="fb-card" :class="{ 'has-reply': item.status === 1 }"
			@click="goDetail(item.id)">
			<!-- 左侧竖条 -->
			<view class="card-bar" :class="'bar-' + statusClass(item.status).replace('is-', '')"></view>

			<view class="card-body">
				<!-- 顶部：状态 + 时间 -->
				<view class="card-head">
					<view class="status-wrap">
						<view class="status-dot" :class="item.status === 1 ? 'dot-done' : 'dot-pending'"></view>
						<view class="status-dot" :class="statusClass(item.status)"></view>
						<text class="status-text" :class="statusClass(item.status)">{{ statusText(item.status) }}</text>
						<view v-if="item.status === 2 && item.userRead === 0" class="unread-tag">新</view>
					</view>
					<text class="card-time">{{ formatTime(item.createTime) }}</text>
				</view>

				<!-- 意见内容 -->
				<view class="card-content">{{ item.content }}</view>

				<!-- 官方回复 -->
				<view v-if="item.status === 1 && item.replyContent" class="reply-block">
					<view class="reply-head">
						<text class="reply-icon">💬</text>
						<text class="reply-label">官方回复</text>
					</view>
					<text class="reply-text">{{ item.replyContent }}</text>
				</view>

				<!-- 底部箭头 -->
				<view class="card-footer">
					<text class="view-more">查看详情</text>
					<text class="arrow">›</text>
				</view>
			</view>
		</view>

		<view v-if="loading" class="loading">加载中...</view>
		<view v-else-if="noMore && list.length" class="no-more">— 没有更多了 —</view>

		<!-- 悬浮按钮 -->
		<view class="fab-btn" @click="goSubmit">
			<text class="fab-icon">✏️</text>
			<text class="fab-text">提意见</text>
		</view>
	</view>
</template>

<script>
	import {
		listMyFeedback
	} from '@/api/feedback'

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
			async loadData() {
				if (this.loading) return
				this.loading = true
				try {
					const res = await listMyFeedback(this.pageNum, this.pageSize)
					const records = res.records || []
					this.list = this.pageNum === 1 ? records : this.list.concat(records)
					if (this.list.length >= res.total) this.noMore = true
				} catch (e) {} finally {
					this.loading = false
				}
			},

			formatTime(t) {
				if (!t) return ''
				const s = String(t).replace('T', ' ')
				return s.slice(0, 16)
			},

			goDetail(id) {
				uni.navigateTo({
					url: `/pages/feedback/detail?id=${id}`
				})
			},

			goSubmit() {
				uni.navigateTo({
					url: '/pages/feedback/submit'
				})
			},

			statusText(status) {
				if (status === 0) return '已提交'
				if (status === 1) return '处理中'
				if (status === 2) return '已解决'
				return '未知'
			},

			statusClass(status) {
				if (status === 0) return 'is-pending'
				if (status === 1) return 'is-processing'
				if (status === 2) return 'is-done'
				return 'is-pending'
			}
		}
	}
</script>

<style lang="scss" scoped>
	
	.dot-pending {
	  background: #e6a23c;
	  box-shadow: 0 0 8rpx rgba(230, 162, 60, 0.6);
	}
	
	.dot-processing {
	  background: #00a8ff;
	  box-shadow: 0 0 8rpx rgba(0, 168, 255, 0.6);
	  animation: dot-pulse 1.6s ease-in-out infinite;
	}
	
	.dot-done {
	  background: #4e6e58;
	  box-shadow: 0 0 8rpx rgba(78, 110, 88, 0.5);
	}
	
	@keyframes dot-pulse {
	  0%, 100% { opacity: 1; }
	  50% { opacity: 0.4; }
	}
	
	.card-bar.bar-processing {
	  background: linear-gradient(180deg, #00a8ff, #00f0ff);
	}
	
	.feedback-container {
		min-height: 100vh;
		padding: 30rpx 30rpx 160rpx;
		background: #f6f1e4;
		box-sizing: border-box;
	}

	/* ============ 顶部提示 ============ */
	.header-tip {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 22rpx 24rpx;
		margin-bottom: 28rpx;
		background: #fbf7ec;
		border-left: 6rpx solid #e6a23c;
		border-radius: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(90, 78, 58, 0.04);
	}

	.tip-icon {
		font-size: 32rpx;
		line-height: 1;
	}

	.tip-text {
		font-size: 24rpx;
		color: #8a8278;
		letter-spacing: 1rpx;
	}

	/* ============ 空状态 ============ */
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 180rpx 0;
	}

	.empty-icon {
		font-size: 120rpx;
		margin-bottom: 28rpx;
		opacity: 0.45;
	}

	.empty-text {
		font-size: 30rpx;
		color: #3a322c;
		font-weight: 600;
		letter-spacing: 2rpx;
	}

	.empty-tip {
		font-size: 24rpx;
		color: #8a8278;
		margin-top: 14rpx;
		letter-spacing: 1rpx;
	}

	/* ============ 卡片 ============ */
	.fb-card {
		position: relative;
		display: flex;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 16rpx;
		margin-bottom: 24rpx;
		overflow: hidden;
		transition: all 0.2s;
	}

	.fb-card:active {
		opacity: 0.85;
		transform: scale(0.995);
	}

	/* 左侧竖条 */
	.card-bar {
		width: 8rpx;
		flex-shrink: 0;
	}

	.bar-pending {
		background: linear-gradient(180deg, #e6a23c, #d4a94a);
	}

	.bar-done {
		background: linear-gradient(180deg, #4e6e58, #7ba889);
	}

	.card-body {
		flex: 1;
		padding: 24rpx 26rpx 20rpx;
		min-width: 0;
	}

	/* ============ 卡片头部 ============ */
	.card-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 16rpx;
	}

	.status-wrap {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.status-dot {
		width: 12rpx;
		height: 12rpx;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.dot-pending {
		background: #e6a23c;
		box-shadow: 0 0 8rpx rgba(230, 162, 60, 0.6);
	}

	.dot-done {
		background: #4e6e58;
		box-shadow: 0 0 8rpx rgba(78, 110, 88, 0.5);
	}

	.status-text {
		font-size: 24rpx;
		color: #5c5348;
		font-weight: 600;
		letter-spacing: 1rpx;
	}

	/* "新" 标 */
	.unread-tag {
		margin-left: 4rpx;
		padding: 0 10rpx;
		height: 28rpx;
		line-height: 28rpx;
		font-size: 20rpx;
		color: #f6f1e4;
		background: #b03a2e;
		border-radius: 14rpx;
		font-weight: 600;
		letter-spacing: 1rpx;
	}

	.card-time {
		font-size: 22rpx;
		color: #8a8278;
		letter-spacing: 0.5rpx;
	}

	/* ============ 意见内容 ============ */
	.card-content {
		font-size: 28rpx;
		color: #3a322c;
		line-height: 1.65;
		margin-bottom: 18rpx;
		word-break: break-all;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	/* ============ 官方回复 ============ */
	.reply-block {
		padding: 18rpx 20rpx;
		background: #f6f1e4;
		border-radius: 10rpx;
		margin-bottom: 18rpx;
	}

	.reply-head {
		display: flex;
		align-items: center;
		gap: 8rpx;
		margin-bottom: 10rpx;
	}

	.reply-icon {
		font-size: 22rpx;
	}

	.reply-label {
		font-size: 22rpx;
		color: #4e6e58;
		font-weight: 600;
		letter-spacing: 2rpx;
	}

	.reply-text {
		font-size: 26rpx;
		color: #5c5348;
		line-height: 1.6;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		word-break: break-all;
	}

	/* ============ 卡片底部 ============ */
	.card-footer {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 6rpx;
		padding-top: 16rpx;
		border-top: 1rpx dashed #e2d8c0;
	}

	.view-more {
		font-size: 24rpx;
		color: #b03a2e;
		letter-spacing: 1rpx;
	}

	.arrow {
		font-size: 30rpx;
		color: #b03a2e;
		line-height: 1;
		font-weight: 300;
	}

	/* ============ 加载 / 没有更多 ============ */
	.loading,
	.no-more {
		text-align: center;
		font-size: 24rpx;
		color: #8a8278;
		padding: 50rpx 0;
		letter-spacing: 2rpx;
	}

	/* ============ 悬浮按钮 ============ */
	.fab-btn {
		position: fixed;
		right: 40rpx;
		bottom: calc(60rpx + env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		gap: 10rpx;
		padding: 22rpx 34rpx;
		background: linear-gradient(135deg, #b03a2e, #c9453a);
		color: #f6f1e4;
		border-radius: 50rpx;
		box-shadow: 0 8rpx 24rpx rgba(176, 58, 46, 0.4);
		font-size: 28rpx;
		letter-spacing: 2rpx;
		z-index: 100;
	}

	.fab-btn:active {
		opacity: 0.85;
		transform: scale(0.96);
	}

	.fab-icon {
		font-size: 30rpx;
	}

	.fab-text {
		font-weight: 600;
	}
</style>