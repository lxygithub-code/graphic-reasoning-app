<template>
	<view class="page">
		<!-- 水墨装饰：淡墨晕染 -->
		<view class="ink-orb orb-1"></view>
		<view class="ink-orb orb-2"></view>
		<view class="ink-mountain"></view>

		<!-- 状态栏占位 -->
		<view class="status-bar" :style="{ height: statusBarHeight + 'px' }"></view>

		<!-- 品牌区 -->
		<view class="brand">
			<view class="brand-seal">图</view>
			<text class="brand-title">图推达人</text>
		</view>

		<!-- 副标题 -->
		<view class="subtitle">
			<view class="subtitle-line"></view>
			<text class="subtitle-text">图形推理 · 每日精进</text>
			<view class="subtitle-line"></view>
		</view>

		<!-- ★ 昨日错题排行榜 -->
		<view class="ranking-wrap" v-if="rankingList.length">
			<view class="ranking-header">
				<text class="ranking-title">昨日错题排行榜</text>
				<text class="ranking-sub">大家都在这里栽跟头</text>
			</view>

			<view class="ranking-list">
				<view class="ranking-item" v-for="(item, i) in rankingList" :key="item.questionId"
					@click="goRankingDetail(item.questionId)">
					<!-- 序号：前三名特殊高亮 -->
					<view class="rank-index" :class="'rank-' + (i + 1)">
						{{ i + 1 }}
					</view>

					<!-- 题目内容 -->
					<text class="rank-text">{{ item.content || '看图答题' }}</text>

					<!-- 错误人数 -->
					<text class="rank-count">{{ item.wrongCount }}人错</text>
				</view>
			</view>
		</view>

		<!-- 空状态（如果昨天没人错题） -->
		<view class="ranking-wrap empty-wrap" v-else>
			<view class="empty-seal">全</view>
			<view class="empty-text-main">昨日全对，无人失分</view>
			<view class="empty-text-sub">大家太强啦，今天继续保持！</view>
		</view>

		<!-- ★ 个人中心入口（副标题右下方） -->
		<view class="user-entry-wrap">
			<view class="user-entry" @tap="goProfile">
				<image v-if="userInfo.avatarUrl" :src="picUrl(userInfo.avatarUrl)" class="user-avatar"
					mode="aspectFill" />
				<view v-else class="user-avatar-placeholder">
					<text class="icon-text">👤</text>
				</view>
				<view class="user-info">
					<text class="user-nickname">{{ userInfo.nickname || '点击登录 / 完善资料' }}</text>
					<text class="user-tip">个人中心 ›</text>
				</view>
			</view>
		</view>

		<!-- 底部 CTA -->
		<view class="cta" @tap="onStart">
			<text class="cta-text">开启今日练习</text>
			<view class="cta-seal"></view>
		</view>

		<!-- 页脚题字 -->
		<view class="footer">
			<text class="footer-text">每日一练 · 持之以恒</text>
		</view>
	</view>
</template>

<script>
	import {
		getUserInfo
	} from '@/api/user'
	import {
		picUrl
	} from '@/utils/request'
	import {
		getYesterdayWrongRanking
	} from '@/api/practice' // ★ 引入排行榜接口

	export default {
		name: 'Index',
		data() {
			return {
				statusBarHeight: 20,
				userInfo: {
					nickname: '',
					avatarUrl: ''
				},
				rankingList: [] // ★ 数据源改为排行榜
			};
		},
		onLoad() {
			try {
				const sys = uni.getSystemInfoSync();
				this.statusBarHeight = sys.statusBarHeight || 20;
			} catch (e) {}
			// ★ 游客也能加载排行榜
			this.loadRanking()
		},
		onShow() {
			// 每次回到首页刷新用户信息
			this.loadUserInfo()
		},
		methods: {
			picUrl,

			// ★ 加载昨日错题排行榜
			async loadRanking() {
				try {
					const res = await getYesterdayWrongRanking()
					this.rankingList = res || []
				} catch (e) {
					console.warn('排行榜加载失败', e)
				}
			},

			async loadUserInfo() {
				try {
					const res = await getUserInfo()
					if (res) {
						this.userInfo = {
							nickname: res.nickname || '',
							avatarUrl: res.avatarUrl || ''
						}
						return
					}
				} catch (e) {
					// 接口失败，走下面的兜底
				}

				// ★ 兜底：从本地缓存读
				const cached = uni.getStorageSync('userInfo')
				if (cached) {
					this.userInfo = {
						nickname: cached.nickname || '',
						avatarUrl: cached.avatarUrl || ''
					}
				}
			},

			onStart() {
				uni.navigateTo({
					url: '/pages/home/home',
					fail: (err) => {
						console.error('navigateTo home fail:', err);
						uni.showToast({
							title: '页面开发中',
							icon: 'none'
						});
					}
				});
			},

			goProfile() {
				// 未登录：跳登录页
				if (!uni.getStorageSync('token')) {
					uni.navigateTo({
						url: '/pages/login/login',
						fail: (err) => {
							console.error('navigateTo login fail:', err)
							uni.showToast({
								title: '页面开发中',
								icon: 'none'
							})
						}
					})
					return
				}

				// 已登录：进个人中心
				uni.navigateTo({
					url: '/pages/profile/profile',
					fail: (err) => {
						console.error('navigateTo profile fail:', err)
						uni.showToast({
							title: '页面开发中',
							icon: 'none'
						})
					}
				})
			},

			// ★ 跳转到错题详情
			goRankingDetail(questionId) {
				if (!questionId) return
				uni.navigateTo({
					url: `/pages/question/detail?questionId=${questionId}`
				})
			}
		}
	};
</script>

<style lang="scss" scoped>
	/* ==================== 排行榜样式 ==================== */
	.ranking-wrap {
		position: relative;
		z-index: 2;
		margin: 60rpx 60rpx 0;
		padding: 32rpx;
		background: rgba(251, 247, 236, 0.9);
		border: 2rpx solid #e2d8c0;
		border-radius: 24rpx;
		box-shadow: 0 6rpx 18rpx rgba(58, 50, 44, 0.06);
	}

	.ranking-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		margin-bottom: 20rpx;
		padding-bottom: 16rpx;
		border-bottom: 2rpx dashed #e2d8c0;
	}

	.ranking-title {
		font-size: 30rpx;
		font-weight: 700;
		color: #3a322c;
		letter-spacing: 2rpx;
	}

	.ranking-sub {
		font-size: 22rpx;
		color: #8a8278;
	}

	.ranking-list {
		display: flex;
		flex-direction: column;
		gap: 16rpx;
	}

	.ranking-item {
		display: flex;
		align-items: center;
		padding: 10rpx 0;

		&:active {
			opacity: 0.7;
		}
	}

	/* 序号样式 */
	.rank-index {
		width: 44rpx;
		height: 44rpx;
		border-radius: 50%;
		background: #e6ddc9;
		/* 默认浅灰色 */
		color: #5c5348;
		font-size: 24rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		flex-shrink: 0;
	}

	/* 前三名高亮 */
	.rank-1 {
		background: #b03a2e;
		/* 朱砂红 */
		color: #f6f1e4;
		box-shadow: 0 4rpx 10rpx rgba(176, 58, 46, 0.3);
	}

	.rank-2 {
		background: #e6a23c;
		/* 锦葵黄 */
		color: #fff;
	}

	.rank-3 {
		background: #c9bda3;
		/* 浅墨褐 */
		color: #fff;
	}

	/* 题目文字 */
	.rank-text {
		flex: 1;
		font-size: 26rpx;
		color: #3a322c;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* 错误人数 */
	.rank-count {
		font-size: 22rpx;
		color: #b03a2e;
		font-weight: 600;
		margin-left: 16rpx;
		flex-shrink: 0;
	}

	/* 空状态 */
	/* 空状态美化版 */
	.empty-wrap {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 50rpx 32rpx 60rpx;
		background: linear-gradient(180deg, rgba(251, 247, 236, 0.9) 0%, rgba(246, 241, 228, 0.9) 100%);
	}

	/* 仿朱砂印章 */
	.empty-seal {
		width: 64rpx;
		height: 64rpx;
		border: 3rpx solid #b03a2e;
		border-radius: 10rpx;
		color: #b03a2e;
		font-size: 32rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-6deg);
		margin-bottom: 24rpx;
		opacity: 0.9;
		box-shadow: 0 4rpx 10rpx rgba(176, 58, 46, 0.15);
	}

	.empty-text-main {
		font-size: 32rpx;
		font-weight: 600;
		color: #3a322c;
		letter-spacing: 4rpx;
		margin-bottom: 12rpx;
	}

	.empty-text-sub {
		font-size: 24rpx;
		color: #8a8278;
		letter-spacing: 2rpx;
	}

	/* ===== 原有水墨风样式 ===== */
	.page {
		position: relative;
		width: 100vw;
		min-height: 100vh;
		overflow: hidden;
		background: #f6f1e4;
		box-sizing: border-box;
	}

	.ink-orb {
		position: absolute;
		border-radius: 50%;
		pointer-events: none;
	}

	.orb-1 {
		top: -140rpx;
		right: -160rpx;
		width: 500rpx;
		height: 500rpx;
		background: radial-gradient(circle, rgba(122, 108, 88, 0.12) 0%, rgba(122, 108, 88, 0) 70%);
	}

	.orb-2 {
		bottom: 260rpx;
		left: -180rpx;
		width: 460rpx;
		height: 460rpx;
		background: radial-gradient(circle, rgba(122, 108, 88, 0.10) 0%, rgba(122, 108, 88, 0) 70%);
	}

	.ink-mountain {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 120rpx;
		height: 200rpx;
		background:
			radial-gradient(ellipse at 20% 100%, rgba(90, 78, 58, 0.10) 0%, rgba(90, 78, 58, 0) 60%),
			radial-gradient(ellipse at 75% 100%, rgba(90, 78, 58, 0.12) 0%, rgba(90, 78, 58, 0) 55%);
		pointer-events: none;
	}

	.status-bar {
		position: relative;
		z-index: 2;
	}

	.brand {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		padding-top: 140rpx;
		/* 稍微减小一点间距，给排行榜留空间 */
	}

	.brand-seal {
		width: 56rpx;
		height: 56rpx;
		border: 3rpx solid #b03a2e;
		border-radius: 8rpx;
		color: #b03a2e;
		font-size: 30rpx;
		font-weight: 700;
		display: flex;
		align-items: center;
		justify-content: center;
		transform: rotate(-6deg);
		margin-right: 20rpx;
	}

	.brand-title {
		font-size: 76rpx;
		font-weight: 700;
		color: #3a322c;
		letter-spacing: 10rpx;
	}

	.subtitle {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-top: 30rpx;
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

	.user-entry-wrap {
		position: relative;
		z-index: 2;
		display: flex;
		justify-content: flex-end;
		padding: 40rpx 60rpx 0;
	}

	.user-entry {
		display: flex;
		align-items: center;
		gap: 16rpx;
		padding: 12rpx 28rpx 12rpx 12rpx;
		background: rgba(251, 247, 236, 0.9);
		border: 2rpx solid #e2d8c0;
		border-radius: 50rpx;
		box-shadow: 0 6rpx 18rpx rgba(58, 50, 44, 0.08);
		transition: all 0.2s;

		&:active {
			opacity: 0.85;
			transform: scale(0.98);
		}
	}

	.user-avatar {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: #f0e8d8;
		flex-shrink: 0;
	}

	.user-avatar-placeholder {
		width: 72rpx;
		height: 72rpx;
		border-radius: 50%;
		background: #f0e8d8;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.icon-text {
		font-size: 36rpx;
	}

	.user-info {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.user-nickname {
		font-size: 28rpx;
		color: #3a322c;
		font-weight: 600;
		max-width: 300rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-tip {
		font-size: 20rpx;
		color: #8a8278;
		letter-spacing: 2rpx;
		margin-top: 4rpx;
	}

	.cta {
		position: absolute;
		left: 90rpx;
		right: 90rpx;
		bottom: calc(200rpx + constant(safe-area-inset-bottom));
		bottom: calc(200rpx + env(safe-area-inset-bottom));
		z-index: 2;
		height: 100rpx;
		border-radius: 50rpx;
		background: #3a322c;
		box-shadow: 0 10rpx 28rpx rgba(58, 50, 44, 0.28);
		display: flex;
		align-items: center;
		justify-content: center;

		&:active {
			opacity: 0.85;
			transform: scale(0.98);
		}
	}

	.cta-text {
		color: #f6f1e4;
		font-size: 32rpx;
		font-weight: 600;
		letter-spacing: 6rpx;
	}

	.cta-seal {
		position: absolute;
		right: 40rpx;
		width: 16rpx;
		height: 16rpx;
		border-radius: 4rpx;
		background: #b03a2e;
	}

	.footer {
		position: absolute;
		left: 0;
		right: 0;
		bottom: calc(80rpx + constant(safe-area-inset-bottom));
		bottom: calc(80rpx + env(safe-area-inset-bottom));
		z-index: 2;
		display: flex;
		justify-content: center;
	}

	.footer-text {
		font-size: 22rpx;
		color: #b3a98f;
		letter-spacing: 6rpx;
	}
</style>