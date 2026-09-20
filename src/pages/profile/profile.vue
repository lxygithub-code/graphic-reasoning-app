<template>
  <view class="profile-container">
    <!-- 头像 + 昵称 -->
    <view class="user-card">
      <view class="avatar-wrap" @click="chooseAvatar">
        <image
          v-if="userInfo.avatarUrl"
          :src="picUrl(userInfo.avatarUrl)"
          class="avatar"
          mode="aspectFill"
        />
        <view v-else class="avatar-placeholder">
          <text>点击设置头像</text>
        </view>
      </view>

      <view class="nickname-row">
        <input
          v-model="userInfo.nickname"
          class="nickname-input"
          placeholder="点击设置昵称"
          maxlength="20"
          @blur="saveNickname"
          @confirm="saveNickname"
        />
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
  </view>
</template>

<script>
import { getUserInfo, updateUserProfile } from '@/api/user'
import { picUrl } from '@/utils/request'

export default {
  data() {
    return {
      userInfo: {
        id: null,
        nickname: '',
        avatarUrl: ''
      }
    }
  },
  onShow() {
    this.loadUserInfo()
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

    // 选头像（微信新版 open-type="chooseAvatar"）
    chooseAvatar() {
      const that = this
      // 小程序：用 button open-type 更标准，这里用 uni.chooseImage 兼容
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
          const filePath = res.tempFilePaths[0]
          try {
            uni.showLoading({ title: '上传中...' })
            // 上传到后端
            const url = await that.uploadAvatar(filePath)
            that.userInfo.avatarUrl = url
            await updateUserProfile({ avatarUrl: url })
            uni.showToast({ title: '头像已更新', icon: 'success' })
          } catch (e) {
            uni.showToast({ title: '上传失败', icon: 'none' })
          } finally {
            uni.hideLoading()
          }
        }
      })
    },

    // 上传头像文件（uni.uploadFile）
    uploadAvatar(filePath) {
      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: 'http://192.168.0.146:8866/api/admin/upload/image',  // 或改成小程序端的上传接口
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
        await updateUserProfile({ nickname })
        uni.showToast({ title: '昵称已保存', icon: 'success' })
      } catch (e) {}
    },

    goHistory() {
      uni.navigateTo({ url: '/pages/history/history' })
    },

    goFavorite() {
      uni.navigateTo({ url: '/pages/favorite/favorite' })
    },
	
	goWrong() {
	  uni.navigateTo({ url: '/pages/wrong/wrong' })
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