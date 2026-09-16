<template>
  <view class="login-container">
    <image src="/static/logo.png" mode="aspectFit" class="logo"></image>
    <u-button type="primary" shape="circle" @click="handleLogin">微信一键登录</u-button>
  </view>
</template>

<script>
import request from '@/utils/request.js'
export default {
  methods: {
    async handleLogin() {
      const res = await request({
        url: '/user/login',
        method: 'POST',
        data: { code: 'mock_code' }
      })
      // 存储用户信息
      this.$store.commit('SET_USER', res.userInfo)
      this.$store.commit('SET_OPENID', res.openid)
      uni.setStorageSync('userInfo', res.userInfo)
      uni.setStorageSync('openid', res.openid)
      // 跳转首页
      uni.reLaunch({
        url: '/pages/index/index'
      })
    }
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.logo {
  width: 200rpx;
  height: 200rpx;
  margin-bottom: 100rpx;
}
</style>