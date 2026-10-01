<template>
	<view class="profile-container">
		<!-- ★ 未登录：显示登录引导 -->
		<view v-if="!isLoggedIn" class="login-guide">
			<view class="login-guide-icon">👤</view>
			<view class="login-guide-text">登录后可查看答题记录、收藏、错题</view>
			<view class="login-guide-btn" @click="goLogin">立即登录</view>
		</view>

		<!-- ★ 已登录：显示个人中心 -->
		<template v-else>
			<!-- 头像 + 昵称 -->
			<view class="user-card">
				<button class="avatar-wrap" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
					<image v-if="userInfo.avatarUrl" :src="picUrl(userInfo.avatarUrl)" class="avatar"
						mode="aspectFill" />
					<view v-else class="avatar-placeholder">
						<text>点击设置头像</text>
					</view>
				</button>

				<view class="nickname-row">
					<input v-model="userInfo.nickname" class="nickname-input" placeholder="点击设置昵称" maxlength="20"
						@blur="saveNickname" @confirm="saveNickname" />
				</view>
			</view>

			<!-- 功能入口 -->
			<view class="menu-group">
				<view class="menu-item" @click="goHistory">
					<view class="menu-left">
						<text class="menu-icon">📊</text>
						<text>答题记录</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>

				<view class="menu-item" @click="goFavorite">
					<view class="menu-left">
						<text class="menu-icon">⭐</text>
						<text>我的收藏</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>

				<view class="menu-item" @click="goWrong">
					<view class="menu-left">
						<text class="menu-icon">📕</text>
						<text>我的错题</text>
					</view>
					<text class="menu-arrow">›</text>
				</view>
			</view>
		</template>
	</view>
</template>

<script>
	import {
		getUserInfo,
		updateUserProfile
	} from '@/api/user'
	import {
		picUrl,
		BASE_URL
	} from '@/utils/request'

	export default {
		data() {
			return {
				isLoggedIn: false,
				userInfo: {
					id: null,
					nickname: '',
					avatarUrl: ''
				}
			}
		},

		onShow() {
			this.isLoggedIn = !!uni.getStorageSync('token')
			if (this.isLoggedIn) {
				this.loadUserInfo()
			}
		},

		// ★ 删掉了 onLoad 里的强制跳转

		methods: {
			picUrl,

			goLogin() {
				uni.navigateTo({
					url: '/pages/login/login'
				})
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

			/** ★ 新版微信标准头像选择 */
			async onChooseAvatar(e) {
				const tempPath = e.detail.avatarUrl
				if (!tempPath) return

				try {
					uni.showLoading({
						title: '上传中...'
					})
					const url = await this.uploadAvatar(tempPath)
					this.userInfo.avatarUrl = url
					await updateUserProfile({
						avatarUrl: url
					})

					// 同步本地缓存
					const cached = uni.getStorageSync('userInfo') || {}
					uni.setStorageSync('userInfo', {
						...cached,
						avatarUrl: url
					})

					uni.showToast({
						title: '头像已更新',
						icon: 'success'
					})
				} catch (err) {
					uni.showToast({
						title: '上传失败',
						icon: 'none'
					})
				} finally {
					uni.hideLoading()
				}
			},

			/** ★ 改成用户端上传接口 */
			uploadAvatar(filePath) {
				return new Promise((resolve, reject) => {
					uni.uploadFile({
						url: `${BASE_URL}/api/upload/image`,
						filePath,
						name: 'file',
						header: {
							'Authorization': 'Bearer ' + (uni.getStorageSync('token') || '')
						},
						success: (res) => {
							const data = JSON.parse(res.data)
							if (data.code === 0) {
								resolve(data.data)
							} else {
								reject(data.msg)
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
					// 同步本地缓存
					const cached = uni.getStorageSync('userInfo') || {}
					uni.setStorageSync('userInfo', {
						...cached,
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
			}
		}
	}
</script>

<style lang="scss" scoped>
	.profile-container {
		min-height: 100vh;
		padding: 30rpx;
		background: #f6f1e4;
		box-sizing: border-box;
	}

	/* ★ 关键：清掉 button 默认样式 */
	.avatar-wrap {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		overflow: hidden;
		border: 4rpx solid #e2d8c0;
		background: #fff;
		margin-bottom: 24rpx;
		padding: 0 !important;
		/* ★ 清 button 默认 padding */
		line-height: normal !important;
		/* ★ 清 button 默认行高 */
		display: block;
	}

	.avatar-wrap::after {
		border: none !important;
		/* ★ 清 button 默认边框 */
	}

	.avatar {
		width: 100%;
		height: 100%;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		color: #8a8278;
		text-align: center;
		padding: 10rpx;
		box-sizing: border-box;
	}

	.user-card {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.nickname-row {
		display: flex;
		align-items: center;
		width: 100%;
		justify-content: center;
	}

	.nickname-input {
		font-size: 32rpx;
		color: #3a322c;
		text-align: center;
		padding: 12rpx 24rpx;
		background: #f6f1e4;
		border-radius: 40rpx;
		min-width: 300rpx;
	}

	.menu-group {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 30rpx;
		border-bottom: 1rpx solid #e2d8c0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
		font-size: 30rpx;
		color: #3a322c;
	}

	.menu-icon {
		font-size: 36rpx;
	}

	.menu-arrow {
		font-size: 36rpx;
		color: #8a8278;
	}

	/* ★ 新增：未登录引导 */
	.login-guide {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 160rpx 60rpx;
	}

	.login-guide-icon {
		font-size: 120rpx;
		margin-bottom: 40rpx;
	}

	.login-guide-text {
		font-size: 28rpx;
		color: #8a8278;
		margin-bottom: 60rpx;
		text-align: center;
		line-height: 1.6;
		letter-spacing: 1rpx;
	}

	.login-guide-btn {
		padding: 24rpx 80rpx;
		background: #3a322c;
		color: #f6f1e4;
		font-size: 30rpx;
		border-radius: 48rpx;
		letter-spacing: 4rpx;
		box-shadow: 0 6rpx 14rpx rgba(58, 50, 44, 0.2);

		&:active {
			opacity: 0.85;
		}
	}

	.profile-container {
		min-height: 100vh;
		padding: 30rpx;
		background: #f6f1e4;
		box-sizing: border-box;
	}

	.user-card {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		padding: 40rpx;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 30rpx;
	}

	.avatar-wrap {
		width: 160rpx;
		height: 160rpx;
		border-radius: 50%;
		overflow: hidden;
		border: 4rpx solid #e2d8c0;
		background: #fff;
		margin-bottom: 24rpx;
	}

	.avatar {
		width: 100%;
		height: 100%;
	}

	.avatar-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 22rpx;
		color: #8a8278;
		text-align: center;
		padding: 10rpx;
		box-sizing: border-box;
	}

	.nickname-row {
		display: flex;
		align-items: center;
		width: 100%;
		justify-content: center;
	}

	.nickname-input {
		font-size: 32rpx;
		color: #3a322c;
		text-align: center;
		padding: 12rpx 24rpx;
		background: #f6f1e4;
		border-radius: 40rpx;
		min-width: 300rpx;
	}

	.menu-group {
		background: #fbf7ec;
		border: 2rpx solid #e2d8c0;
		border-radius: 20rpx;
		overflow: hidden;
	}

	.menu-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 32rpx 30rpx;
		border-bottom: 1rpx solid #e2d8c0;
	}

	.menu-item:last-child {
		border-bottom: none;
	}

	.menu-left {
		display: flex;
		align-items: center;
		gap: 16rpx;
		font-size: 30rpx;
		color: #3a322c;
	}

	.menu-icon {
		font-size: 36rpx;
	}

	.menu-arrow {
		font-size: 36rpx;
		color: #8a8278;
	}
</style>