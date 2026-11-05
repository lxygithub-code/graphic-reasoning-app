<template>
	<view class="admin-container">
		<view class="header-title">今日实时监控</view>
		<view class="header-sub">仅管理员可见 · {{ todayStr }}</view>

		<!-- 核心指标 -->
		<view class="kpi-grid">
			<view class="kpi-card">
				<text class="kpi-num">{{ data.todayActiveCount || 0 }}</text>
				<text class="kpi-label">今日活跃用户</text>
			</view>
			<view class="kpi-card">
				<text class="kpi-num" style="color: #b03a2e;">{{ data.todayRequestCount || 0 }}</text>
				<text class="kpi-label">今日总请求</text>
			</view>
		</view>

		<!-- 今日错题 Top 5 -->
		<view class="section">
			<view class="sec-title">今日错题 Top 5</view>
			<view class="rank-list">
				<!-- 增加点击事件 -->
				<view class="rank-item" v-for="(item, i) in data.wrongTop5" :key="i"
					@click="goQuestionDetail(item.questionId)">
					<view class="rank-idx" :class="'top-' + (i + 1)">{{ i + 1 }}</view>
					<view class="rank-content">{{ item.content }}</view>
					<view class="rank-count">{{ item.wrongCount }}错</view>
				</view>
				<view v-if="!data.wrongTop5?.length" class="empty-tip">今日暂无错题</view>
			</view>
		</view>

		<!-- 用户请求明细 -->
		<view class="section">
			<view class="sec-title">用户请求与刷题量</view>
			<view class="user-list">
				<view class="user-item" v-for="u in data.userStats" :key="u.userId">
					<image v-if="u.avatarUrl" :src="picUrl(u.avatarUrl)" class="avatar" />
					<view v-else class="avatar placeholder">👤</view>

					<view class="u-info">
						<text class="u-name">{{ u.nickname }}</text>
						<text class="u-stat">请求: <text class="hl">{{ u.requestCount }}</text> 次</text>
					</view>

					<view class="u-practice">
						刷题 {{ u.practiceCount }} 题
					</view>
				</view>
				<view v-if="!data.userStats?.length" class="empty-tip">今日暂无用户访问</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getMiniappDashboard
	} from '@/api/user' // 或 api/stats
	import {
		picUrl
	} from '@/utils/request'

	export default {
		data() {
			return {
				data: {
					todayActiveCount: 0,
					todayRequestCount: 0,
					wrongTop5: [],
					userStats: []
				},
				todayStr: ''
			}
		},
		onLoad() {
			const d = new Date()
			this.todayStr = `${d.getMonth() + 1}月${d.getDate()}日`
			this.loadData()
		},
		methods: {
			picUrl,
			async loadData() {
				uni.showLoading({
					title: '加载中'
				})
				try {
					const res = await getMiniappDashboard()
					this.data = res || this.data
				} catch (e) {
					uni.showToast({
						title: '加载失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},
			// 新增：跳转到题目详情页
			goQuestionDetail(questionId) {
				if (!questionId) return
				uni.navigateTo({
					url: `/pages/question/detail?questionId=${questionId}`
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.admin-container {
		min-height: 100vh;
		padding: 30rpx;
		background: #f6f1e4;
	}

	.header-title {
		font-size: 40rpx;
		font-weight: 800;
		color: #3a322c;
		letter-spacing: 2rpx;
	}

	.header-sub {
		font-size: 24rpx;
		color: #8a8278;
		margin-top: 8rpx;
		margin-bottom: 30rpx;
	}

	/* KPI 指标 */
	.kpi-grid {
		display: flex;
		gap: 20rpx;
		margin-bottom: 30rpx;
	}

	.kpi-card {
		flex: 1;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		padding: 30rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		box-shadow: 0 6rpx 16rpx rgba(90, 78, 58, 0.04);
	}

	.kpi-num {
		font-size: 56rpx;
		font-weight: 800;
		color: #3a322c;
	}

	.kpi-label {
		font-size: 24rpx;
		color: #8a8278;
		margin-top: 8rpx;
	}

	/* 模块容器 */
	.section {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		padding: 24rpx;
		margin-bottom: 30rpx;
	}

	.sec-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #3a322c;
		margin-bottom: 20rpx;
		padding-left: 16rpx;
		border-left: 6rpx solid #b03a2e;
	}

	/* 错题排行 */
	.rank-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.rank-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding-bottom: 16rpx;
		border-bottom: 1rpx dashed #e2d8c0;

		&:last-child {
			border: none;
			padding-bottom: 0;
		}
	}

	.rank-idx {
		width: 36rpx;
		height: 36rpx;
		border-radius: 50%;
		background: #c9bda3;
		color: #fff;
		font-size: 22rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.top-1 {
		background: #b03a2e;
	}

	.top-2 {
		background: #e6a23c;
	}

	.top-3 {
		background: #c9bda3;
	}

	.rank-content {
		flex: 1;
		font-size: 26rpx;
		color: #3a322c;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.rank-count {
		font-size: 24rpx;
		color: #b03a2e;
		font-weight: 600;
	}

	/* 用户明细 */
	.user-list {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.user-item {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.avatar {
		width: 64rpx;
		height: 64rpx;
		border-radius: 50%;
		background: #f0e8d8;
	}

	.avatar.placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
	}

	.u-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.u-name {
		font-size: 28rpx;
		color: #3a322c;
		font-weight: 500;
		margin-bottom: 4rpx;
	}

	.u-stat {
		font-size: 22rpx;
		color: #8a8278;
	}

	.hl {
		color: #b03a2e;
		font-weight: 600;
	}

	.u-practice {
		font-size: 24rpx;
		color: #4e6e58;
		font-weight: 600;
		background: #eef5ee;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
	}

	.empty-tip {
		text-align: center;
		font-size: 24rpx;
		color: #8a8278;
		padding: 20rpx 0;
	}
</style>