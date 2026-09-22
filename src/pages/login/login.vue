<template>
  <view class="login-container">
    <image src="https://graphic-push-images.oss-cn-beijing.aliyuncs.com/static/logo.png" mode="aspectFit" class="logo"></image>
    <view class="login-btn" @click="handleLogin">微信一键登录</view>
  </view>
</template>

<script>
import request from '@/utils/request'
export default {
  methods: {
    async handleLogin() {
      let code = ''
      // 小程序端：通过 uni.login 获取微信临时 code
      // #ifdef MP-WEIXIN
      try {
        code = await this.wxLoginCode()
      } catch (e) {
        uni.showToast({ title: '微信登录失败', icon: 'none' })
        return
      }
      // #endif
      const res = await request({
        url: '/api/auth/login',
        method: 'POST',
        data: { code }
      })
      // 存储 token（后续请求自动携带 Authorization）
      if (res && res.token) {
        uni.setStorageSync('token', res.token)
      }
      // 存储用户信息
      if (res && res.userInfo) {
        this.$store.commit('SET_USER', res.userInfo)
        uni.setStorageSync('userInfo', res.userInfo)
      }
      if (res && res.openid) {
        this.$store.commit('SET_OPENID', res.openid)
        uni.setStorageSync('openid', res.openid)
      }
      // 跳转首页
      uni.reLaunch({
        url: '/pages/index/index'
      })
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
</style>
