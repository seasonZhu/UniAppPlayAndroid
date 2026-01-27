import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import * as PubFuc from './common/public.func.js'
import httpPlugin from './config/http.js'

export function createApp() {
  const app = createSSRApp(App)

  // 创建 Pinia store
  const pinia = createPinia()
  app.use(pinia)

  // HTTP 插件
  app.use(httpPlugin)

  // 全局属性（兼容原有代码）
  app.config.globalProperties.$pubFuc = PubFuc.default || PubFuc

  return {
    app,
    pinia
  }
}
