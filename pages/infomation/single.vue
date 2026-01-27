<template>
	<view class="container">
		<view v-if="list.length > 0" class="list">
			<view v-for="(item, index) in list" :key="index" class="project-item" @click="onClick(index)">
				<view class="project-header">
					<image
						class="project-icon"
						:src="item.envelopePic || '/static/user/placeholder.png'"
						mode="aspectFill"
					></image>
					<view class="project-info">
						<text class="project-title">{{ item.title }}</text>
						<view class="project-meta">
							<text class="author">{{ item.author || '匿名' }}</text>
							<text v-if="item.zan" class="zan">{{ item.zan }} 赞</text>
						</view>
					</view>
				</view>
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
import { ref, computed } from 'vue'
import { onMounted } from 'vue'
import { api } from '@/config/http.js'

// Props
const props = defineProps({
	item: {
		type: Object,
		default() {
			return {}
		}
	}
})

// 数据
const page = ref(0)
const list = ref([])
const isFirstLoad = ref(true)

// 计算属性
const id = computed(() => {
	return props.item.id
})

// 获取项目列表
const getProjectList = async () => {
	if (list.value.length > 0) {
		return list.value
	}

	try {
		const result = await api.projectList({ cid: props.item.id.toString() }, 0)
		const dataList = (result && result.data && result.data.datas) || []
		list.value = list.value.concat(dataList)
		isFirstLoad.value = false
		return list.value
	} catch (error) {
		console.error('获取项目列表失败', error)
		isFirstLoad.value = false
		return list.value
	}
}

// 重新加载数据
const reloadData = () => {
	page.value = 0
	list.value = []
	isFirstLoad.value = true
	getProjectList()
}

// 打开页面
const openPage = (url, id, title) => {
	const titleParam = title ? '&title=' + encodeURIComponent(title) : ''
	uni.navigateTo({
		url: '/pages/web/index?url=' + encodeURIComponent(url) + '&id=' + id + titleParam
	})
}

// 点击列表项
const onClick = (index) => {
	const item = list.value[index]
	const url = item.link
	const id = item.id
	const title = item.title
	openPage(url, id, title)
}

// 生命周期
onMounted(() => {
	getProjectList()
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

.list {
	background-color: #fff;
}

.project-item {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.project-item:last-child {
	border-bottom: none;
}

.project-header {
	display: flex;
	flex-direction: row;
	align-items: center;
}

.project-icon {
	width: 80rpx;
	height: 80rpx;
	border-radius: 8rpx;
	margin-right: 20rpx;
	background-color: #f5f5f5;
}

.project-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.project-title {
	font-size: 30rpx;
	color: #333;
	line-height: 1.5;
	margin-bottom: 10rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.project-meta {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
}

.author {
	font-size: 24rpx;
	color: #999;
}

.zan {
	font-size: 24rpx;
	color: #2979FF;
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
