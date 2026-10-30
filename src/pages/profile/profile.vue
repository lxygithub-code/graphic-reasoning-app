<template>
	<view class="profile-container">
		<!-- 顶部水墨装饰 -->
		<view class="ink-orb"></view>

		<!-- 头像 + 昵称卡片 -->
		<view class="user-card">
			<view class="avatar-wrap" @click="chooseAvatar">
				<image v-if="userInfo.avatarUrl" :src="picUrl(userInfo.avatarUrl)" class="avatar" mode="aspectFill" />
				<view v-else class="avatar-placeholder">
					<text class="placeholder-icon">👤</text>
				</view>
				<view class="avatar-edit-badge">修改</view>
			</view>

			<view class="nickname-row">
				<input v-model="userInfo.nickname" class="nickname-input" placeholder="点击设置昵称" maxlength="20"
					@blur="saveNickname" @confirm="saveNickname" />
				<text class="edit-icon">✎</text>
			</view>
			<text class="user-tip">点击头像或昵称可修改资料</text>
		</view>

		<!-- 功能入口 -->
		<view class="menu-group">
			<view class="menu-item" @click="goHistory">
				<view class="menu-left">
					<view class="icon-wrap bg-blue"><text class="menu-icon">📊</text></view>
					<text class="menu-text">答题记录</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view class="menu-item" @click="goFavorite">
				<view class="menu-left">
					<view class="icon-wrap bg-yellow"><text class="menu-icon">⭐</text></view>
					<text class="menu-text">我的收藏</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view class="menu-item" @click="goWrong">
				<view class="menu-left">
					<view class="icon-wrap bg-red"><text class="menu-icon">📕</text></view>
					<text class="menu-text">我的错题</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view class="menu-item" @click="goCategory">
				<view class="menu-left">
					<view class="icon-wrap bg-green"><text class="menu-icon">🗂️</text></view>
					<text class="menu-text">题型分类</text>
				</view>
				<text class="menu-arrow">›</text>
			</view>

			<view class="menu-item" @click="goFeedback">
				<view class="menu-left">
					<view class="icon-wrap bg-purple"><text class="menu-icon">💬</text></view>
					<text class="menu-text">意见箱</text>
					<view v-if="feedbackUnread > 0" class="menu-badge">
						{{ feedbackUnread > 99 ? '99+' : feedbackUnread }}
					</view>
				</view>
				<text class="menu-arrow">›</text>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		getUserInfo,
		updateUserProfile
	} from '@/api/user'
	import {
		picUrl
	} from '@/utils/request'
	import {
		getFeedbackUnreadCount
	} from '@/api/feedback'

	export default {
		data() {
			return {
				userInfo: {
					id: null,
					nickname: '',
					avatarUrl: ''
				},
				feedbackUnread: 0
			}
		},
		onShow() {
			this.loadUserInfo()
			this.loadFeedbackUnread()
		},
		methods: {
			picUrl,

			async loadUserInfo() {
				try {
					const res = await getUserInfo()
					this.userInfo = {
						id: res.id,
						nickname: res.nickname || '',
						avatarUrl: res.avatarUrl || ''
					}
				} catch (e) {}
			},

			async loadFeedbackUnread() {
				try {
					this.feedbackUnread = Number(await getFeedbackUnreadCount()) || 0
				} catch (e) {}
			},

			// 选头像
			chooseAvatar() {
				const that = this
				uni.chooseImage({
					count: 1,
					sizeType: ['compressed'],
					sourceType: ['album', 'camera'],
					success: async (res) => {
						const filePath = res.tempFilePaths[0]
						try {
							uni.showLoading({
								title: '上传中...'
							})
							const url = await that.uploadAvatar(filePath)
							that.userInfo.avatarUrl = url
							await updateUserProfile({
								avatarUrl: url
							})
							uni.showToast({
								title: '头像已更新',
								icon: 'success'
							})
						} catch (e) {
							uni.showToast({
								title: '上传失败',
								icon: 'none'
							})
						} finally {
							uni.hideLoading()
						}
					}
				})
			},

			// 上传头像文件
			uploadAvatar(filePath) {
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: 'https://api.graphicmaster.cn/api/admin/upload/image', // 确保这里是你正式的域名
						filePath,
						name: 'file',
						header: {
							'Authorization': 'Bearer ' + (uni.getStorageSync('token') || '')
						},
						success: (res) => {
							try {
								const data = JSON.parse(res.data)
								if (data.code === 0) {
									resolve(data.data)
								} else {
									reject(data.msg || '上传失败')
								}
							} catch (e) {
								reject(e)
							}
						},
						fail: reject
					})
				})
			},

			async saveNickname() {
				const nickname = (this.userInfo.nickname || '').trim()
				if (!nickname) return
				try {
					await updateUserProfile({
						nickname
					})
					uni.showToast({
						title: '昵称已保存',
						icon: 'success'
					})
				} catch (e) {}
			},

			goHistory() {
				uni.navigateTo({
					url: '/pages/history/history'
				})
			},

			goFavorite() {
				uni.navigateTo({
					url: '/pages/favorite/favorite'
				})
			},

			goWrong() {
				uni.navigateTo({
					url: '/pages/wrong/wrong'
				})
			},

			goCategory() {
				uni.navigateTo({
					url: '/pages/category/category'
				})
			},

			goFeedback() {
				uni.navigateTo({
					url: '/pages/feedback/index'
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-container {
		position: relative;
		min-height: 100vh;
		padding: 30rpx;
		background: #f6f1e4;
		box-sizing: border-box;
		overflow: hidden;
	}

	/* 背景水墨点缀 */
	.ink-orb {
		position: absolute;
		top: -100rpx;
		right: -100rpx;
		width: 400rpx;
		height: 400rpx;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(122, 108, 88, 0.08) 0%, rgba(122, 108, 88, 0) 70%);
		pointer-events: none;
	}

	/* ==================== 用户信息卡片 ==================== */
	.user-card {
		position: relative;
		z-index: 2;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 24rpx;
		padding: 48rpx 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 40rpx;
		box-shadow: 0 8rpx 24rpx rgba(90, 78, 58, 0.06);
	}

	.avatar-wrap {
		position: relative;
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		padding: 6rpx;
		background: linear-gradient(135deg, #e2d8c0 0%, #f6f1e4 100%);
		margin-bottom: 24rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
	}

	.avatar {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: #fff;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: #f0e8d8;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.placeholder-icon {
		font-size: 60rpx;
		opacity: 0.5;
	}

	.avatar-edit-badge {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(58, 50, 44, 0.8);
		color: #f6f1e4;
		font-size: 20rpx;
		padding: 4rpx 16rpx;
		border-radius: 20rpx;
		backdrop-filter: blur(4px);
		white-space: nowrap;
	}

	.nickname-row {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		margin-bottom: 12rpx;
	}

	.nickname-input {
		font-size: 36rpx;
		font-weight: 600;
		color: #3a322c;
		text-align: center;
		min-width: 200rpx;
		max-width: 400rpx;
		padding: 8rpx 16rpx;
		background: transparent;
	}

	.edit-icon {
		font-size: 28rpx;
		color: #8a8278;
		margin-left: 8rpx;
	}

	.user-tip {
		font-size: 22rpx;
		color: #b3a98f;
		letter-spacing: 1rpx;
	}

	/* ==================== 菜单列表 ==================== */
	.menu-group {
		position: relative;
		z-index: 2;
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 24rpx;
		padding: 10rpx 0;
		box-shadow: 0 8rpx 24rpx rgba(90, 78, 58, 0.04);
	}

	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 26rpx 30rpx;
		transition: background 0.2s;

		&:active {
			background: rgba(226, 216, 192, 0.3);
		}
	}

	.menu-left {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	/* 图标背景 */
	.icon-wrap {
		width: 56rpx;
		height: 56rpx;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.bg-blue {
		background: #e8f3f8;
	}

	.bg-yellow {
		background: #fcf3e3;
	}

	.bg-red {
		background: #f9e8e4;
	}

	.bg-green {
		background: #eef5ee;
	}

	.bg-purple {
		background: #f2ebf8;
	}

	.menu-icon {
		font-size: 32rpx;
	}

	.menu-text {
		font-size: 30rpx;
		color: #3a322c;
		font-weight: 500;
		letter-spacing: 1rpx;
	}

	.menu-badge {
		margin-left: 12rpx;
		min-width: 32rpx;
		height: 32rpx;
		padding: 0 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #b03a2e;
		color: #f6f1e4;
		font-size: 20rpx;
		border-radius: 16rpx;
		font-weight: 600;
	}

	.menu-arrow {
		font-size: 36rpx;
		color: #c9bda3;
		font-weight: 300;
		line-height: 1;
	}
</style>