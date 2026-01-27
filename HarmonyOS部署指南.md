# HarmonyOS Next 部署指南

## 问题说明

在 HarmonyOS Next 系统下运行时可能遇到 WebView 权限错误：
```
Error message:Parameter Error. The type of "permissionList" must be Array<Permissions>.
Error code:401
```

## 解决方案

### 1. manifest.json 配置

确保 `manifest.json` 中包含 HarmonyOS 配置：

```json
{
  "app-plus": {
    "distribute": {
      "android": {},
      "ios": {},
      "harmonyos": {
        "abilities": []
      }
    }
  }
}
```

### 2. pages.json 配置

web-view 页面需要添加平台特定配置：

```json
{
  "path": "pages/web/index",
  "style": {
    "navigationBarTitleText": "详细",
    "app-plus": {
      "bounce": "none"
    }
  }
}
```

### 3. web-view 组件使用

使用条件编译确保兼容性：

```vue
<template>
  <view>
    <!-- #ifdef APP-PLUS -->
    <web-view :src="decodedUrl"></web-view>
    <!-- #endif -->
    <!-- #ifndef APP-PLUS -->
    <web-view :src="decodedUrl" :update-title="false"></web-view>
    <!-- #endif -->
  </view>
</template>
```

## 编译配置

### HBuilderX 配置

1. 打开 HBuilderX
2. 点击 `发行` → `原生App-云打包`
3. 选择平台：
   - ✅ Android
   - ✅ iOS
   - ✅ HarmonyOS

### 命令行编译

```bash
# 安装依赖
npm install

# 编译为 wgt
npm run build:app

# 或使用 uni-app CLI
npx uni build --platform app --type wgt
```

## HarmonyOS 特定注意事项

### 1. 权限声明

HarmonyOS 需要在 `module.json5` 中声明网络权限：

```json
{
  "module": {
    "requestPermissions": [
      {
        "name": "ohos.permission.INTERNET"
      },
      {
        "name": "ohos.permission.GET_NETWORK_INFO"
      }
    ]
  }
}
```

### 2. WebView 配置

确保 webview 组件不传入不支持的属性：

**支持的属性：**
- `src` (必需)
- `@message` (消息事件)

**不推荐使用的属性（可能导致崩溃）：**
- `permissionList` (自动处理)
- `@onPostMessage` (使用 @message 替代)

### 3. 已知问题

#### 问题 1: permissionList 类型错误
**错误:** `Parameter Error. The type of "permissionList" must be Array<Permissions>`

**原因:** HarmonyOS 运行时会自动处理权限，不需要手动传入

**解决:** 不要在 web-view 组件上设置 permissionList 属性

#### 问题 2: 页面切换崩溃
**错误:** WebView 页面切换时应用崩溃

**解决:** 确保 pages.json 中添加了 `app-plus` 配置

## 测试清单

### 功能测试
- [ ] WebView 正常加载外部网页
- [ ] 页面切换不崩溃
- [ ] 下拉刷新正常
- [ ] 返回导航正常
- [ ] 收藏功能正常

### 兼容性测试
- [ ] HarmonyOS Next (API 9+)
- [ ] Android 5.0+
- [ ] iOS 9.0+

## 调试技巧

### 1. 启用日志

```javascript
onLoad((option) => {
  console.log('WebView参数:', option)
  console.log('HarmonyOS平台:', uni.getSystemInfoSync().platform)
})
```

### 2. 捕获错误

```javascript
try {
  // WebView 操作
} catch (error) {
  console.error('WebView错误:', error)
  uni.showModal({
    title: '错误',
    content: JSON.stringify(error)
  })
}
```

### 3. 使用 DevTools

HarmonyOS 支持 DevTools 调试：
1. 打开 DevTools
2. 连接设备
3. 查看 Console 和 Network

## 参考资源

- [uni-app HarmonyOS 文档](https://uniapp.dcloud.net.cn/tutorial/app-harmonyos.html)
- [HarmonyOS WebView 文档](https://developer.huawei.com/consumer/cn/doc/harmonyos-guides-V5/web-component-V5)
- [uni-app 社区](https://ask.dcloud.net.cn/)

## 版本兼容性

| uni-app 版本 | HarmonyOS API | 状态 |
|-------------|--------------|------|
| 3.0.0-alpha-4080720251125001 | 9+ | ✅ 测试通过 |
| 3.0.0-alpha-3xxx | 9+ | ⚠️ 可能存在兼容性问题 |

## 更新日志

### 2025-01-27
- 添加 HarmonyOS 配置
- 修复 WebView permissionList 错误
- 优化页面切换稳定性

---

**最后更新：** 2025年1月27日
**维护者：** 开发团队
