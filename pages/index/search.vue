<template>
	<view class="container">
		<view class="flex-wrap">
			<view class="wrap" v-for="(item, index) in list" :key="index">
				<view class="tag" @click="click(item.name)">{{ item.name }}</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad, onNavigationBarSearchInputChanged, onNavigationBarSearchInputConfirmed, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import { api } from '@/config/http.js'

// 数据
const searchWord = ref('')
const list = ref([])

// 获取热词
const getHotKey = async () => {
	try {
		const result = await api.hotKey()
		list.value = (result && result.data) || []
		console.log(list.value)
	} catch (error) {
		console.error('获取热词失败:', error)
		list.value = []
	}
}

// 点击热词
const click = (keyword) => {
	openPage(keyword)
}

// 打开搜索结果页
const openPage = (keyword) => {
	uni.navigateTo({
		url: '/pages/index/result?keyword=' + keyword
	})
}

// 显示提示
const showToast = () => {
	uni.showToast({
		title: '请输入关键词',
		icon: 'none'
	})
}

// 搜索输入变化
onNavigationBarSearchInputChanged((e) => {
	console.log(e)
	searchWord.value = e.text
})

// 搜索确认
onNavigationBarSearchInputConfirmed((e) => {
	console.log(e.text)
	if (e.text.length === 0) {
		showToast()
		return
	}
	openPage(searchWord.value)
})

// 导航栏按钮点击
onNavigationBarButtonTap((e) => {
	console.log(e && e.float)
	console.log(searchWord.value)
	if (searchWord.value.length === 0) {
		showToast()
		return
	}
	openPage(searchWord.value)
})

// 生命周期
onLoad(() => {
	getHotKey()
})
</script>

<script>
export default {
	options: {
		styleIsolation: 'shared'
	}
}
</script>

<style scoped>
.container {
	background-color: #f5f5f5;
	min-height: 100vh;
}

.flex-wrap {
	display: flex;
	flex-wrap: wrap;
	margin: 16rpx;
}

.wrap {
	margin: 10rpx;
}

.tag {
	padding: 12rpx 24rpx;
	background-color: #fff;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
}

.tag:active {
	background-color: #e0e0e0;
}
</style>
