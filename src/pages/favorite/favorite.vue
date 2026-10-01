<template>
	<view class="favorite-container">
		<view v-if="!loading && !list.length && !loadError" class="empty">暂无收藏</view>
		<view v-else-if="loadError && !list.length" class="empty">加载失败，请下拉重试</view>
		<view v-for="item in list" :key="item.id" class="fav-card" @click="goDetail(item.id)">
			<!-- 题干 -->
			<view class="fav-content">{{ item.content }}</view>

			<!-- 题干图片 -->
			<image v-if="item.imageUrl" :src="picUrl(item.imageUrl)" class="fav-image" mode="widthFix"
				referrer-policy="no-referrer" />

			<!-- 标签 -->
			<view class="fav-meta">
				<text v-if="item.source" class="fav-tag">{{ item.source }}</text>
				<text v-if="item.category" class="fav-tag">{{ item.category }}</text>
				<text v-if="item.examType" class="fav-tag">{{ examTypeLabel(item.examType) }}</text>
			</view>

			<!-- 操作 -->
			<view class="fav-actions">
				<view class="fav-btn" @click.stop="goDetail(item.id)">查看详情</view>
				<view class="fav-btn fav-btn-danger" @click.stop="handleCancel(item)">取消收藏</view>
			</view>
		</view>

		<view v-if="loading" class="loading">加载中...</view>
		<view v-else-if="noMore && list.length" class="no-more">没有更多了</view>
	</view>
</template>

<script>
	import {
		listFavorites,
		toggleFavorite
	} from '@/api/favorite'
	import {
		picUrl
	} from '@/utils/request'
	import {
		listDict
	} from '@/api/dict'

	export default {
		data() {
			return {
				list: [],
				pageNum: 1,
				pageSize: 10,
				loading: false,
				noMore: false,
				total: 0, // ★ 新增
				loadError: false, // ★ 新增
				examTypeOptions: []
			}
		},

		onLoad() {
			// ★ 登录检查
			if (!uni.getStorageSync('token')) {
				uni.redirectTo({
					url: '/pages/login/login'
				})
				return
			}
		},

		onShow() {
			// ★ 双保险
			if (!uni.getStorageSync('token')) return

			// 收藏状态会变（新增/取消），每次进入都刷新
			this.pageNum = 1
			this.noMore = false
			this.loadError = false
			this.list = []
			this.loadExamTypeOptions()
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

			async loadExamTypeOptions() {
				try {
					this.examTypeOptions = await listDict('exam_type') || []
				} catch (e) {}
			},

			examTypeLabel(val) {
				const item = this.examTypeOptions.find(o => o.dictValue === val)
				return item ? item.dictLabel : (val || '')
			},

			async loadData() {
				if (this.loading) return
				this.loading = true
				this.loadError = false
				try {
					const res = await listFavorites(this.pageNum, this.pageSize)
					const records = res.records || []
					if (this.pageNum === 1) {
						this.list = records
					} else {
						this.list = this.list.concat(records)
					}
					this.total = res.total || 0 // ★ 记录
					if (this.list.length >= this.total) {
						this.noMore = true
					}
				} catch (e) {
					this.loadError = true // ★ 记录错误
				} finally {
					this.loading = false
				}
			},

			goDetail(questionId) {
				uni.navigateTo({
					url: `/pages/favorite/detail?questionId=${questionId}`
				})
			},

			async handleCancel(item) {
				uni.showModal({
					title: '提示',
					content: '确定取消收藏吗？',
					success: async (res) => {
						if (!res.confirm) return
						try {
							await toggleFavorite(item.id)
							uni.showToast({
								title: '已取消收藏',
								icon: 'success'
							})
							// 本地移除
							this.list = this.list.filter(i => i.id !== item.id)
							this.total = Math.max(0, this.total - 1)
						} catch (e) {
							// authRequest 已处理错误提示
						}
					}
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.favorite-container {
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

	/* 收藏卡片 */
	.fav-card {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-left: 6rpx solid #e6a23c;
		/* 收藏用橙色边，区别于错题的红色 */
		border-radius: 16rpx;
		padding: 24rpx;
		margin-bottom: 20rpx;
		transition: all 0.2s;
	}

	.fav-card:active {
		opacity: 0.9;
		transform: scale(0.995);
	}

	/* 题干 */
	.fav-content {
		font-size: 28rpx;
		color: #3a322c;
		line-height: 1.7;
		margin-bottom: 16rpx;
	}

	/* 题干图片 */
	.fav-image {
		width: 100%;
		margin-bottom: 16rpx;
		border-radius: 8rpx;
		background: #fff;
	}

	/* 标签 */
	.fav-meta {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-bottom: 20rpx;
	}

	.fav-tag {
		padding: 4rpx 14rpx;
		font-size: 22rpx;
		color: #8a8278;
		background: #f6f1e4;
		border-radius: 16rpx;
	}

	/* 操作按钮 */
	.fav-actions {
		display: flex;
		gap: 16rpx;
	}

	.fav-btn {
		flex: 1;
		padding: 16rpx 0;
		text-align: center;
		font-size: 26rpx;
		color: #3a322c;
		background: #f6f1e4;
		border: 1rpx solid #e2d8c0;
		border-radius: 32rpx;
		letter-spacing: 2rpx;
	}

	.fav-btn:active {
		opacity: 0.85;
	}

	.fav-btn-danger {
		color: #b03a2e;
		border-color: #e8c0b8;
		background: #fbf7ec;
	}
</style>