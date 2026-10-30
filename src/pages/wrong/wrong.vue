<template>
	<view class="wrong-container">
		<!-- 顶部操作栏 -->
		<view class="header-bar">
			<text class="title">我的错题</text>
			<text class="manage-btn" :class="{ active: isManageMode }" @click="toggleManageMode">
				{{ isManageMode ? '取消' : '工具' }}
			</text>
		</view>

		<view v-if="!loading && !list.length" class="empty">暂无错题，继续保持~</view>

		<view v-for="item in list" :key="item.id" class="wrong-card"
			:class="{ 'is-selected': selectedIds.includes(item.id) }" @click="handleCardClick(item.id)">
			<!-- 复选框 (仅工具模式显示) -->
			<view v-if="isManageMode" class="checkbox-wrap" @click.stop="toggleSelect(item.id)">
				<view class="checkbox" :class="{ checked: selectedIds.includes(item.id) }">
					<text v-if="selectedIds.includes(item.id)" class="check-icon">✓</text>
				</view>
			</view>

			<view class="card-body">
				<view class="wrong-content">{{ item.content }}</view>

				<image v-if="item.imageUrl" :src="picUrl(item.imageUrl)" class="wrong-image" mode="widthFix"
					referrer-policy="no-referrer" />

				<view class="wrong-meta">
					<text v-if="item.source" class="meta-tag">{{ item.source }}</text>
					<text v-if="item.categoryLabel || item.category" class="meta-tag">
						{{ item.categoryLabel || item.category }}
					</text>
				</view>

				<!-- 操作按钮 (非工具模式显示) -->
				<view v-if="!isManageMode" class="wrong-actions">
					<view class="action-btn primary" @click.stop="goDetail(item.id)">查看详情</view>
					<view class="action-btn" @click.stop="remove(item)">移出错题</view>
				</view>
			</view>
		</view>

		<view v-if="loading" class="loading">加载中...</view>
		<view v-else-if="noMore && list.length" class="no-more">没有更多了</view>

		<!-- 底部悬浮操作栏 (仅工具模式显示) -->
		<view v-if="isManageMode" class="bottom-bar">
			<view class="select-all" @click="toggleSelectAll">
				<view class="checkbox" :class="{ checked: isAllSelected }">
					<text v-if="isAllSelected" class="check-icon">✓</text>
				</view>
				<text>全选</text>
			</view>
			<view class="export-btn" :class="{ disabled: selectedIds.length === 0 }" @click="exportPdf">
				导出 PDF ({{ selectedIds.length }})
			</view>
		</view>
	</view>
</template>

<script>
	import {
		listWrong,
		removeWrong
	} from '@/api/wrong'
	import {
		picUrl,
		request
	} from '@/utils/request'
	import {
		exportWrongPdf
	} from '@/api/practice'
	export default {
		data() {
			return {
				list: [],
				pageNum: 1,
				pageSize: 10,
				loading: false,
				noMore: false,
				// ★ 新增：工具/导出状态
				isManageMode: false,
				selectedIds: []
			}
		},

		computed: {
			// 判断是否全选（基于当前已加载的列表）
			isAllSelected() {
				return this.list.length > 0 && this.selectedIds.length === this.list.length
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
			// ★ 双保险（未登录不加载）
			if (!uni.getStorageSync('token')) return

			this.pageNum = 1
			this.noMore = false
			this.list = []
			this.isManageMode = false
			this.selectedIds = []
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
				} catch (e) {} finally {
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
							uni.showToast({
								title: '已移除',
								icon: 'success'
							})
							this.list = this.list.filter(i => i.id !== item.id)
							// 如果移除的题在已选列表中，同步移除
							this.selectedIds = this.selectedIds.filter(id => id !== item.id)
						} catch (e) {}
					}
				})
			},

			/* ==================== 工具模式相关逻辑 ==================== */

			toggleManageMode() {
				this.isManageMode = !this.isManageMode
				if (!this.isManageMode) {
					this.selectedIds = []
				}
			},

			handleCardClick(id) {
				if (this.isManageMode) {
					this.toggleSelect(id)
				}
			},

			toggleSelect(id) {
				const index = this.selectedIds.indexOf(id)
				if (index > -1) {
					this.selectedIds.splice(index, 1)
				} else {
					this.selectedIds.push(id)
				}
			},

			toggleSelectAll() {
				if (this.isAllSelected) {
					this.selectedIds = []
				} else {
					this.selectedIds = this.list.map(item => item.id)
				}
			},

			async exportPdf() {
				if (this.selectedIds.length === 0) return
				if (this.selectedIds.length > 20) {
					uni.showToast({
						title: '一次最多导出 20 题',
						icon: 'none'
					})
					return
				}

				uni.showLoading({
					title: '正在生成PDF...',
					mask: true
				})

				try {
					// 1. 调用提取出来的 api 接口
					const pdfUrl = await exportWrongPdf(this.selectedIds)

					uni.hideLoading()
					uni.showLoading({
						title: '正在下载...',
						mask: true
					})
					// 2. 下载 PDF 文件
					uni.downloadFile({
						url: pdfUrl,
						success: (res) => {
							uni.hideLoading()
							if (res.statusCode === 200) {
								// 3. 打开文档
								uni.openDocument({
									filePath: res.tempFilePath,
									fileType: 'pdf',
									showMenu: true, // 允许右上角分享或保存
									success: () => {
										this.isManageMode = false
										this.selectedIds = []
									},
									fail: (err) => {
										console.error('打开文档失败', err)
										uni.showToast({
											title: '打开失败',
											icon: 'none'
										})
									}
								})
							}
						},
						fail: (err) => {
							uni.hideLoading()
							console.error('下载失败', err)
							uni.showToast({
								title: '下载失败，请重试',
								icon: 'none'
							})
						}
					})
				} catch (e) {
					uni.hideLoading()
					// 注意：authRequest 抛出的错误结构，如果是自己阻断的需要取 e.msg
					uni.showToast({
						title: (e && e.msg) || '生成失败',
						icon: 'none'
					})
				}
			}
		}
	}
</script>

<style lang="scss" scoped>
	.wrong-container {
		min-height: 100vh;
		padding: 30rpx 30rpx 140rpx;
		/* 底部留白给悬浮栏 */
		background: #f6f1e4;
		box-sizing: border-box;
	}

	/* ============ 顶部 ============ */
	.header-bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24rpx;
		padding: 0 10rpx;
	}

	.title {
		font-size: 32rpx;
		font-weight: 700;
		color: #3a322c;
		letter-spacing: 2rpx;
	}

	.manage-btn {
		font-size: 26rpx;
		color: #8a8278;
		padding: 8rpx 20rpx;
		background: #fbf7ec;
		border: 1rpx solid #e2d8c0;
		border-radius: 30rpx;
		transition: all 0.2s;
	}

	.manage-btn.active {
		color: #b03a2e;
		border-color: #b03a2e;
		background: #fdf3f2;
	}

	.empty,
	.loading,
	.no-more {
		text-align: center;
		font-size: 26rpx;
		color: #8a8278;
		padding: 60rpx 0;
	}

	/* ============ 卡片 ============ */
	.wrong-card {
		display: flex;
		align-items: stretch;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-left: 6rpx solid #b03a2e;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		transition: all 0.2s;
	}

	.wrong-card.is-selected {
		border-color: #b03a2e;
		box-shadow: 0 4rpx 12rpx rgba(176, 58, 46, 0.15);
	}

	.checkbox-wrap {
		display: flex;
		align-items: center;
		padding-left: 24rpx;
	}

	.checkbox {
		width: 40rpx;
		height: 40rpx;
		border: 2rpx solid #c9bda3;
		border-radius: 50%;
		background: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.checkbox.checked {
		background: #b03a2e;
		border-color: #b03a2e;
	}

	.check-icon {
		color: #fff;
		font-size: 24rpx;
		font-weight: bold;
	}

	.card-body {
		flex: 1;
		padding: 24rpx;
		min-width: 0;
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
		flex-wrap: wrap;
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

	/* ============ 底部悬浮栏 ============ */
	.bottom-bar {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		height: 120rpx;
		background: #fbf7ec;
		border-top: 2rpx solid #e2d8c0;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 40rpx;
		padding-bottom: env(safe-area-inset-bottom);
		z-index: 99;
		box-shadow: 0 -4rpx 16rpx rgba(90, 78, 58, 0.08);
	}

	.select-all {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 28rpx;
		color: #3a322c;
	}

	.export-btn {
		padding: 16rpx 48rpx;
		background: #b03a2e;
		color: #f6f1e4;
		font-size: 28rpx;
		font-weight: 600;
		letter-spacing: 2rpx;
		border-radius: 40rpx;
		box-shadow: 0 4rpx 12rpx rgba(176, 58, 46, 0.3);
	}

	.export-btn.disabled {
		background: #c9bda3;
		box-shadow: none;
		pointer-events: none;
	}
</style>