<template>
	<view class="container">
		<text class="title">Vue 3 测试页面</text>
		<text class="text">{{ message }}</text>
		<button @click="handleClick">点击测试</button>
		<text v-if="clicked" class="success">✓ 按钮点击成功！</text>

		<view class="section">
			<text class="section-title">API 测试</text>
			<text>{{ apiStatus }}</text>
			<button @click="testApi" size="mini">测试 API</button>
		</view>

		<view class="section">
			<text class="section-title">Store 测试</text>
			<text>登录状态: {{ userInfo.hasLogin ? '已登录' : '未登录' }}</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { api } from '@/config/http.js'

const message = ref('如果你能看到这个页面，说明 Vue 3 基础功能正常！')
const clicked = ref(false)
const apiStatus = ref('未测试')

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

const handleClick = () => {
	clicked.value = true
	uni.showToast({
		title: '点击成功！',
		icon: 'success'
	})
}

const testApi = async () => {
	apiStatus.value = '测试中...'
	try {
		const result = await api.banner()
		apiStatus.value = 'API 正常！获取到 ' + (result && result.length ? result.length : 0) + ' 条数据'
		console.log('API 测试结果:', result)
	} catch (error) {
		apiStatus.value = 'API 失败: ' + (error.message || '未知错误')
		console.error('API 测试失败:', error)
	}
}

onLoad(() => {
	console.log('测试页面加载成功')
	console.log('User Store:', userInfo.value)
})
</script>

<style scoped>
.container {
	padding: 20rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.title {
	font-size: 40rpx;
	font-weight: bold;
	margin-bottom: 40rpx;
	text-align: center;
}

.text {
	font-size: 28rpx;
	margin-bottom: 20rpx;
	text-align: center;
}

.success {
	color: #4cd964;
	font-size: 28rpx;
	margin-top: 20rpx;
}

.section {
	width: 100%;
	margin-top: 40rpx;
	padding: 20rpx;
	background-color: #f8f8f8;
	border-radius: 10rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	margin-bottom: 20rpx;
	display: block;
}

button {
	margin-top: 20rpx;
}
</style>
