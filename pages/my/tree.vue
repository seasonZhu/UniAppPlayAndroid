<template>
	<view class="container">
		<view v-if="list.length > 0">
			<view v-for="(item, index) in list" :key="index" class="group-item">
				<view class="group-title">{{ item.name }}</view>
				<view class="flex-wrap">
					<view class="wrap" v-for="(child, idx) in item.children" :key="idx">
						<view
							class="tag"
							:style="{ backgroundColor: getTagColor(index, idx) }"
							@click="tagClick(index, idx)"
						>
							{{ child.name }}
						</view>
					</view>
				</view>
				<view class="divider"></view>
			</view>
		</view>

		<!-- 空状态 -->
		<view v-if="!isFirstLoad && list.length === 0" class="empty-state" @click="reloadData">
			<text class="empty-icon">📭</text>
			<text class="empty-text">暂无数据</text>
			<text class="empty-tip">点击屏幕重新加载</text>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/config/http.js'

// 适合阅读的柔和背景色（浅色系）
const tagColors = [
	'#E3F2FD', // 浅蓝
	'#F3E5F5', // 浅紫
	'#E8F5E9', // 浅绿
	'#FFF3E0', // 浅橙
	'#FFEBEE', // 浅红
	'#E0F2F1', // 浅青
	'#F1F8E9', // 浅黄绿
	'#E8EAF6', // 浅靛蓝
	'#FCE4EC', // 浅粉
	'#E0F7FA', // 浅青蓝
	'#FFF9C4', // 浅黄
	'#F5F5F5', // 浅灰
	'#E1F5FE', // 天空蓝
	'#FCE4EC', // 玫瑰粉
	'#E0F2F1', // 薄荷绿
	'#FFF8E1', // 香草黄
]

// 数据
const list = ref([])
const isFirstLoad = ref(true)

// 获取tag颜色
const getTagColor = (groupIndex, tagIndex) => {
	// 使用分组索引和标签索引的组合来生成伪随机颜色
	// 这样同一个tag的颜色是固定的，但不同tag颜色不同
	const colorIndex = (groupIndex * 13 + tagIndex * 7) % tagColors.length
	return tagColors[colorIndex]
}

// 获取体系
const getTree = async () => {
	try {
		const result = await api.tree()
		console.log('体系数据:', result)
		// API返回 {data: [...], errorCode: 0, errorMsg: ""}
		list.value = (result && result.data) || []
		console.log('体系列表:', list.value)
		isFirstLoad.value = false
	} catch (error) {
		console.error('获取体系失败', error)
		list.value = []
		isFirstLoad.value = false
	}
}

// 重新加载数据
const reloadData = () => {
	isFirstLoad.value = true
	getTree()
}

// 点击标签
const tagClick = (index, idx) => {
	console.log('点击了体系:', index, idx)
	const model = list.value[index].children[idx]
	console.log('体系信息:', model.name)
	openPage(model)
}

// 打开页面
const openPage = (model) => {
	console.log('打开体系详细页面')
	uni.navigateTo({
		url: '/pages/my/detail?id=' + model.id + '&name=' + model.name + '&order=' + model.order + '&parentChapterId=' + model.parentChapterId
	})
}

// 生命周期
onLoad(() => {
	getTree()
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

.group-item {
	margin-bottom: 16rpx;
	background-color: #fff;
}

.group-title {
	padding: 24rpx 32rpx;
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	background-color: #fff;
	border-bottom: 1rpx solid #e5e5e5;
}

.flex-wrap {
	display: flex;
	flex-wrap: wrap;
	padding: 16rpx;
}

.wrap {
	margin: 10rpx;
}

.tag {
	padding: 12rpx 24rpx;
	border-radius: 8rpx;
	font-size: 28rpx;
	color: #333;
	transition: all 0.3s;
}

.tag:active {
	opacity: 0.7;
	transform: scale(0.95);
}

.divider {
	height: 1rpx;
	background-color: #e5e5e5;
	margin: 0 32rpx;
}

.empty-state {
	padding: 200rpx 40rpx;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
}

.empty-icon {
	font-size: 120rpx;
	margin-bottom: 30rpx;
	opacity: 0.5;
}

.empty-text {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 16rpx;
	font-weight: 500;
}

.empty-tip {
	font-size: 24rpx;
	color: #999;
}
</style>
