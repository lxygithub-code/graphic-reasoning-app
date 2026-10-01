<template>
	<view class="login-container">
		<!-- 左上角返回按钮：和胶囊垂直对齐 -->
		<view class="back-btn" :style="backBtnStyle" @click="onBack">
			<view class="back-arrow"></view>
		</view>

		<image :src="picUrl('logo.png')" mode="aspectFit" class="logo" />
		<view class="login-btn" @click="handleLogin">微信一键登录</view>
		<view class="tip-text">登录后可保存做题记录、收藏和错题</view>
	</view>
</template>

<script>
	import {
		request,
		picUrl
	} from '@/utils/request'

	export default {
		data() {
			return {
				backBtnStyle: {}
			}
		},

		onLoad() {
			this.calcBackPosition()
		},

		methods: {
			picUrl,

			/** ★ 计算返回按钮位置，和胶囊垂直居中 */
			calcBackPosition() {
				let top = 60 // 兜底：30px 状态栏 + 30px 偏移
				let height = 32

				try {
					// #ifdef MP-WEIXIN
					const menu = wx.getMenuButtonBoundingClientRect()
					// 胶囊中心 y = menu.top + menu.height / 2
					// 返回按钮和胶囊同高，垂直居中
					height = 32
					top = menu.top + (menu.height - height) / 2
					// #endif
				} catch (e) {
					// 兜底（H5 / 其他环境）
					try {
						const sys = uni.getSystemInfoSync()
						top = (sys.statusBarHeight || 20) + 6
					} catch (e2) {}
				}

				this.backBtnStyle = {
					top: top + 'px',
					height: height + 'px'
				}
			},

			onBack() {
				const pages = getCurrentPages()
				if (pages.length > 1) {
					uni.navigateBack()
				} else {
					uni.reLaunch({
						url: '/pages/index/index'
					})
				}
			},

			async handleLogin() {
				let code = ''
				// #ifdef MP-WEIXIN
				try {
					code = await this.wxLoginCode()
				} catch (e) {
					uni.showToast({
						title: '微信登录失败',
						icon: 'none'
					})
					return
				}
				// #endif

				const res = await request({
					url: '/api/auth/login',
					method: 'POST',
					data: {
						code
					}
				})

				if (res && res.token) {
					uni.setStorageSync('token', res.token)
				}
				if (res && res.userInfo) {
					this.$store.commit('SET_USER', res.userInfo)
					uni.setStorageSync('userInfo', res.userInfo)
				}
				if (res && res.openid) {
					this.$store.commit('SET_OPENID', res.openid)
					uni.setStorageSync('openid', res.openid)
				}

				uni.showToast({
					title: '登录成功',
					icon: 'success',
					duration: 800
				})

				setTimeout(() => {
					const pages = getCurrentPages()
					if (pages.length > 1) {
						uni.navigateBack()
					} else {
						uni.reLaunch({
							url: '/pages/index/index'
						})
					}
				}, 800)
			},

			wxLoginCode() {
				return new Promise((resolve, reject) => {
					uni.login({
						provider: 'weixin',
						success: (r) => resolve(r.code),
						fail: reject
					})
				})
			}
		}
	}
</script>

<style lang="scss" scoped>
	.login-container {
		min-height: 100vh;
		background: #f6f1e4;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		position: relative;
	}

	/* ★ 左上角返回按钮：位置由 JS 动态计算 */
	.back-btn {
		position: fixed;
		left: 32rpx;
		width: 56rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
		transition: opacity 0.2s;
	}

	.back-btn:active {
		opacity: 0.5;
	}

	/* ★ CSS 画的箭头（比 ‹ 更精致，不受字体影响） */
	.back-arrow {
		width: 20rpx;
		height: 20rpx;
		border-left: 3rpx solid #3a322c;
		border-bottom: 3rpx solid #3a322c;
		transform: rotate(45deg);
		border-radius: 2rpx;
		margin-left: 4rpx;
		/* 视觉微调，让箭头视觉居中 */
	}

	.logo {
		width: 200rpx;
		height: 200rpx;
		margin-bottom: 100rpx;
	}

	.login-btn {
		min-width: 320rpx;
		padding: 24rpx 64rpx;
		border-radius: 48rpx;
		background: #3a322c;
		color: #f6f1e4;
		font-size: 30rpx;
		letter-spacing: 4rpx;
		text-align: center;
		box-shadow: 0 6rpx 16rpx rgba(58, 50, 44, 0.2);

		&:active {
			opacity: 0.85;
		}
	}

	.tip-text {
		margin-top: 40rpx;
		font-size: 22rpx;
		color: #8a8278;
		letter-spacing: 1rpx;
	}
</style>