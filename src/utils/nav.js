export function safeBack(fallback = '/pages/index/index') {
  const pages = getCurrentPages()
  if (pages.length > 1) {
    uni.navigateBack({ delta: 1 })
  } else {
    uni.reLaunch({ url: fallback })
  }
}