# UniApp Play Android - 玩安卓 uni-app 版

> 从 Vue 2 到 Vue 3 的升级演进，一个开发者的成长记录

## 前言

都说万事开头难，一点也不假。

从我计划学习 uni-app 到真正意义上的开始写代码，真的是花了很久的时间。

其实一旦手动起来了，也没有想象的那么难，毕竟是写过 OC、Swift、Flutter、Python 的人了，JavaScript 写起来就是信手拈来的事情。

**唯一苦恼的是样式 CSS**，我感觉我好不容易适应了 Flutter 的布局逻辑，突然来 HTML 的这一波，感觉怎么又懵了，思路一样，不过写起 CSS 来，还是一点办法都没有。

---

## 项目历程

本项目是一个基于 **uni-app** 开发的玩安卓客户端，历经从 Vue 2 到 Vue 3 的重大技术升级。

### 技术演进

| 阶段 | 技术栈 | 说明 |
|------|--------|------|
| 初版 | Vue 2 + uView UI 2.x + Vuex | 初始开发阶段 |
| 升级后 | Vue 3 + uView Plus + Pinia | Composition API 全面重构 |

---

## 升级概述

你的 uniApp 项目已成功从 **Vue 2 + uView UI 2.x + Vuex** 升级到 **Vue 3 + uView Plus + Pinia**。

### ✅ 已完成的工作

#### 1. 核心配置升级
- **package.json** - 创建了全新的依赖配置，支持 Vue 3 生态
- **manifest.json** - 更新 `vueVersion` 为 "3"
- **main.js** - 重写为 Vue 3 的 `createSSRApp` 入口
- **App.vue** - 迁移到 Composition API (`<script setup>`)

#### 2. 状态管理迁移
- **Vuex → Pinia** - 创建了 `stores/user.js` 替换原 Vuex store
  - 使用 `defineStore` 定义 store
  - 使用 `ref` 管理状态
  - 提供 `storeLogin`、`storeLogout`、`initUserInfo` 方法

#### 3. HTTP 请求重构
- **config/http.config.js** - HTTP 基础配置
- **config/http.js** - 新的 API 封装
  - 基于 `uni.request` 的 Promise 封装
  - 自动处理用户 cookie
  - 提供所有原有 API 方法

#### 4. 页面迁移
已完成迁移的页面：
- ✅ `/pages/index/index.vue` - 首页（轮播图、文章列表、下拉刷新、上拉加载）
- ✅ `/pages/my/index.vue` - 我的（用户信息、积分、导航、登出）
- ✅ `/pages/login/index.vue` - 登录（表单验证、登录逻辑）
- ✅ `/pages/web/index.vue` - 文章详情（webview、收藏功能）

---

## 升级要点详解

### 核心变化

#### 1. 入口文件重写

**Vue 2 (main.js)**
```javascript
import Vue from 'vue'
import App from './App'
import store from './store'
import uView from 'uview-ui'

Vue.use(uView)
Vue.config.productionTip = false

App.mpType = 'app'
const app = new Vue({
  store,
  ...App
})
app.$mount()
```

**Vue 3 (main.js)**
```javascript
import { createSSRApp } from 'vue'
import App from './App.vue'
import { setupStore } from './stores/user'

export function createApp() {
  const app = createSSRApp(App)
  setupStore(app)
  return { app }
}
```

#### 2. 状态管理从 Vuex 到 Pinia

**Vuex**
```javascript
export default new Vuex.Store({
  state: {
    userInfo: null,
    login: false
  },
  mutations: {
    login(state, userInfo) {
      state.userInfo = userInfo
      state.login = true
    }
  }
})
```

**Pinia**
```javascript
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref(null)
  const login = ref(false)

  function storeLogin(info) {
    userInfo.value = info
    login.value = true
  }

  return { userInfo, login, storeLogin }
})
```

#### 3. 组件写法从 Options API 到 Composition API

**Vue 2 (Options API)**
```javascript
export default {
  data() {
    return {
      list: []
    }
  },
  onLoad() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      // ...
    }
  }
}
```

**Vue 3 (Composition API + `<script setup>`)**
```javascript
<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'

const list = ref([])
const userStore = useUserStore()

const fetchData = () => {
  // ...
}

onMounted(() => {
  fetchData()
})
</script>
```

#### 4. API 调用方式变化

**Vue 2**
```javascript
this.$u.api.getHomeArticleList(params)
```

**Vue 3**
```javascript
import { $api } from '@/config/http'

await $api.value.getHomeArticleList(params)
```

#### 5. 全局属性访问

**Vue 2**
```javascript
this.$store
this.$u
this.uni
```

**Vue 3**
```javascript
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
proxy.$store
proxy.$u
```

---

## 项目结构

```
UniAppPlayAndroid/
├── config/              # 配置文件
│   ├── http.config.js  # HTTP 配置
│   └── http.js          # API 封装
├── stores/              # Pinia stores（替换 store/）
│   └── user.js          # 用户状态管理
├── pages/               # 页面文件
├── common/              # 公共函数
├── static/              # 静态资源
├── uni_modules/         # uni-app 插件
├── main.js              # Vue 3 入口
├── App.vue              # Composition API
├── manifest.json         # uni-app 配置
├── pages.json           # 页面路由配置
├── package.json         # 依赖配置
└── VUE3_MIGRATION_GUIDE.md  # 迁移指南
```

---

## 开发指南

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# H5 开发测试
npm run dev:h5

# App 开发测试
npm run dev:app

# 微信小程序
npm run dev:mp-weixin
```

### 编译 wgt 热更新包

```bash
# Android wgt
npm run wgt:android

# iOS wgt
npm run wgt:ios
```

编译产物位于 `unpackage/dist/build/` 目录。

---

## 兼容平台

- ✅ **H5** - 完全支持
- ✅ **微信小程序** - 完全支持
- ✅ **App (Android)** - 完全支持，可编译 wgt
- ✅ **App (iOS)** - 完全支持，可编译 wgt
- ✅ **HarmonyOS Next** - 已适配

---

## 原始开发中遇到的问题

以下是开发初期遇到的一些技术挑战，部分已解决，部分成为了后续优化的方向：

### 1. Cookie 与跨域问题

在 Chrome 浏览器、App、小程序中，请求头加上 cookie 还是不能调用登录后的接口。这是由于跨域请求导致，`本地的 http://localhost:8080 需要跳转调用 https://www.wanandroid.com，浏览器认为不安全，所以被拦截了`。

```
Refused to set unsafe header "cookie"
Access to XMLHttpRequest at 'https://www.wanandroid.com//coin/rank/1/json' from origin 'http://localhost:8080' has been blocked by CORS policy
```

**解决方案**：通过配置开发服务器代理解决跨域问题，H5 环境下使用代理，非 H5 环境直接请求。

#### 1.1 Vite 配置 (vite.config.js)

```javascript
import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

export default defineConfig({
	plugins: [uni()],
	server: {
		port: 8081,
		host: 'localhost',
		proxy: {
			// 代理所有 /api 开头的请求到 WanAndroid API
			'/api': {
				target: 'https://www.wanandroid.com',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	}
})
```

#### 1.2 manifest.json 配置

```json
{
	"h5": {
		"devServer": {
			"host": "localhost",
			"port": 8081,
			"disableHostCheck": true,
			"proxy": {
				"/api": {
					"target": "https://www.wanandroid.com",
					"changeOrigin": true,
					"secure": true
				}
			}
		}
	}
}
```

#### 1.3 HTTP 请求配置 (http.config.js)

```javascript
// H5 环境使用代理
// #ifdef H5
const httpConfig = {
	baseUrl: '/api', // H5环境使用代理
	header: {
		'Access-Control-Allow-Origin': 'https://www.wanandroid.com',
		'Access-Control-Allow-Credentials': true,
	}
}
// #endif

// 非 H5 环境直接请求
// #ifndef H5
const httpConfig = {
	baseUrl: 'https://www.wanandroid.com/',
	header: {
		'Access-Control-Allow-Origin': 'https://www.wanandroid.com',
		'Access-Control-Allow-Credentials': true,
	}
}
// #endif
```

#### 1.4 请求封装 (http.js)

在请求中自动携带用户 Cookie：

```javascript
function request(options) {
	return new Promise((resolve, reject) => {
		// 获取用户 cookie
		const userStore = useUserStore()
		const cookie = userStore.userInfo.cookie || ''

		// 合并请求头
		const header = {
			...httpConfig.header,
			cookie,  // 自动携带 cookie
			...options.header
		}

		uni.request({
			url: httpConfig.baseUrl + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: header,
			success: (res) => {
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					reject(res)
				}
			}
		})
	})
}
```

**核心原理**：
- 开发阶段：通过 Vite devServer 代理，将 `/api` 前缀的请求转发到 `https://www.wanandroid.com`，避免浏览器跨域限制
- 生产阶段：非 H5 环境直接请求真实 API 地址

### 2. Tabs 与页面滑动

项目和公众号页面的 tabs 与页面滑动实现较为复杂。目前尝试了两个方案：
- 逐页加载：体验和流量都好，但上拉加载更多状态显示有问题
- 一次性加载：体验有卡顿，不节约流量

SwiperPage 滑动、tabs 滑动，在超过边界的时候没有滚动到可视区域。

### 3. 组件化与公共方法

对于组件化、方法的公共化一开始不是很了解，后来通过 slot 的使用逐渐掌握了技巧。

### 4. 收藏页面侧滑删除

收藏页面的侧滑删除在 App 端存在问题，感觉需要触摸事件和 CSS 结合才能完成。

### 5. Web 页面功能按钮弹出

Web 页面的功能按钮在 iOS 和 Android 端都无法弹出，微信小程序无法弹出是因为右侧被微信占用了。

### 6. 轮播图详情页

轮播图点击进入 web 页面独立用了一个 vue 文件，之前怎么改都有异常。

---

## 相关项目

作者还开发了其他技术栈的玩安卓客户端：

- **Swift 版**: [RxStudy](https://github.com/seasonZhu/RxStudy)
- **Flutter 版**: [GetXStudy](https://github.com/seasonZhu/GetXStudy)
- **HarmonyOS 版**: [HarmonyStudy](https://github.com/seasonZhu/HarmonyStudy)

## 我的掘金主页

[我的主页](https://juejin.cn/user/4353721778057997)

---

