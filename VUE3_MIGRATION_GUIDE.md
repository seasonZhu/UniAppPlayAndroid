# Vue 3 页面迁移指南

本指南帮助你将剩余的 Vue 2 页面迁移到 Vue 3 Composition API。

## 迁移模板

### Vue 2 Options API → Vue 3 Composition API

```vue
<!-- Vue 2 Options API -->
<template>
  <view>{{ message }}</view>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  computed: {
    ...mapState(['userInfo'])
  },
  methods: {
    ...mapMutations(['storeLogin']),
    handleClick() {
      this.message = 'Clicked'
    }
  },
  onLoad() {
    console.log('Load')
  }
}
</script>

<!-- Vue 3 Composition API -->
<template>
  <view>{{ message }}</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'

// Store
const userStore = useUserStore()
const { storeLogin } = userStore

// 当前实例（访问全局属性）
const instance = getCurrentInstance()
const $api = computed(() => instance?.appContext.config.globalProperties.$api)

// Data → ref
const message = ref('Hello')

// Computed
const userInfo = computed(() => userStore.userInfo)

// Methods
const handleClick = () => {
  message.value = 'Clicked'
}

// 生命周期
onLoad(() => {
  console.log('Load')
})
</script>

<script>
import { getCurrentInstance } from 'vue'
export default {
  options: {
    styleIsolation: 'shared'
  }
}
</script>
```

## 核心迁移规则

### 1. Data → ref/reactive
```javascript
// Vue 2
data() {
  return {
    count: 0,
    user: { name: 'John' }
  }
}

// Vue 3
const count = ref(0)
const user = ref({ name: 'John' })
// 或者
const state = reactive({
  count: 0,
  user: { name: 'John' }
})
```

### 2. Computed → computed()
```javascript
// Vue 2
computed: {
  ...mapState(['userInfo']),
  fullName() {
    return this.user.firstName + ' ' + this.user.lastName
  }
}

// Vue 3
import { computed } from 'vue'
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const fullName = computed(() => {
  return user.value.firstName + ' ' + user.value.lastName
})
```

### 3. Methods → 普通函数
```javascript
// Vue 2
methods: {
  ...mapMutations(['storeLogin']),
  handleClick() {
    this.count++
  }
}

// Vue 3
const { storeLogin } = userStore

const handleClick = () => {
  count.value++
}
```

### 4. 生命周期钩子
```javascript
// Vue 2
onLoad() { },
onReady() { },
onShow() { },
onHide() { },
onUnload() { },
onPullDownRefresh() { },
onReachBottom() { }

// Vue 3（从 @dcloudio/uni-app 导入）
import { onLoad, onReady, onShow, onHide, onUnload, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'

onLoad(() => { })
onReady(() => { })
onShow(() => { })
onHide(() => { })
onUnload(() => { })
onPullDownRefresh(() => { })
onReachBottom(() => { })
```

### 5. API 调用
```javascript
// Vue 2 (使用 uView HTTP)
this.$u.api.login(username, password).then(res => {
  console.log(res)
})

// Vue 3 (使用新的 HTTP 封装)
const instance = getCurrentInstance()
const $api = computed(() => instance?.appContext.config.globalProperties.$api)

const res = await $api.value.login(username, password)
console.log(res)
```

### 6. Store (Vuex → Pinia)
```javascript
// Vue 2 (Vuex)
import { mapState, mapMutations } from 'vuex'
computed: {
  ...mapState(['userInfo'])
},
methods: {
  ...mapMutations(['storeLogin'])
}

// Vue 3 (Pinia)
import { useUserStore } from '@/stores/user.js'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)
const { storeLogin } = userStore
```

## 剩余待迁移页面列表

1. `/pages/ad/ad.vue` - 广告页（已注释）
2. `/pages/index/result.vue` - 搜索结果页
3. `/pages/index/search.vue` - 搜索页
4. `/pages/infomation/index.vue` - 项目页
5. `/pages/infomation/single.vue` - 项目详情
6. `/pages/login/register.vue` - 注册页
7. `/pages/my/collection.vue` - 我的收藏
8. `/pages/my/detail.vue` - 体系详情
9. `/pages/my/history.vue` - 积分历史
10. `/pages/my/ranking.vue` - 积分排名
11. `/pages/my/tree.vue` - 体系
12. `/pages/publicNum/index.vue` - 公众号
13. `/pages/web/banner-web.vue` - 轮播图详情
14. `/pages/my/callNativeMethod.vue` - 调用原生方法
15. `/pages/my/nativeMapComponent.vue` - 调用原生页面

## 快速迁移步骤

1. **读取原文件** - 了解页面结构和功能
2. **创建新文件** - 使用 Composition API 重写
3. **测试功能** - 确保所有功能正常
4. **提交代码** - 完成迁移

## 注意事项

1. **this 不再需要** - 在 `<script setup>` 中不需要 `this`
2. **访问 ref 值** - 需要 `.value`（模板中不需要）
3. **异步操作** - 推荐使用 `async/await`
4. **全局属性** - 通过 `getCurrentInstance()` 访问
5. **组件注册** - 使用 `easycom` 自动注册，无需手动导入

## 编译和测试

```bash
# 安装依赖
npm install

# 开发模式（H5）
npm run dev:h5

# 开发模式（小程序）
npm run dev:mp-weixin

# 构建生产版本（App）
npm run build:app

# 构建 wgt 文件
npm run wgt:android
npm run wgt:ios
```

## 已完成迁移的页面

- ✅ `/pages/index/index.vue` - 首页
- ✅ `/pages/my/index.vue` - 我的
- ✅ `/pages/login/index.vue` - 登录
- ✅ `/pages/web/index.vue` - 文章详情

## HarmonyOS Next 支持

目前迁移未包含 HarmonyOS Next 支持。如需添加，请：

1. 更新 `manifest.json` 中的 HarmonyOS 配置
2. 安装 `@dcloudio/uni-app-harmony` 依赖
3. 在 HBuilderX 中配置鸿蒙打包环境
