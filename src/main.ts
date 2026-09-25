import { createSSRApp } from 'vue'
import { createStore } from 'vuex'           // 导入 createStore
import uviewPlus from 'uview-plus'
import App from './App.vue'
import storeOptions from './store/index.js'           // 导入你的 store 配置对象
import { picUrl } from '@/utils/request' 

export function createApp() {
  const app = createSSRApp(App)
  
  // 创建 Vuex store 实例
  const store = createStore(storeOptions)
  
  // 注册 uview-plus
  app.use(uviewPlus)
  // 注册 Vuex store
  app.use(store)
  
  app.config.globalProperties.picUrl = picUrl
  return {
    app
  }
}