<template>
	<view class="container">
		<view v-if="list.length > 0" class="list">
			<view v-for="(item, index) in list" :key="index" class="cell-item" @click="click(index)">
				<view class="cell-title">{{ item.title }}</view>
				<view class="cell-label">{{ item.author }}</view>
				<view class="cell-value">{{ item.zan }}</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loadmore" v-if="!isFirstLoad && list.length > 0 && status !== 'none'">
			<text class="loadmore-text">{{ loadmoreText }}</text>
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
import { onLoad, onReachBottom } from '@dcloudio/uni-app'
import { api } from '@/config/http.js'

// 数据
const list = ref([])
const page = ref(0)
const status = ref('loadmore')
const option = ref({})
const isFirstLoad = ref(true)

// 计算加载更多文本
const loadmoreText = computed(() => {
	switch (status.value) {
		case 'loading':
			return '加载中...'
		case 'nomore':
			return '没有更多了'
		default:
			return '点击加载更多'
	}
})

// 获取体系详情
const treeDetai = async (opt) => {
	try {
		const result = await api.treeDetail(opt.id, page.value)
		console.log(result)
		uni.stopPullDownRefresh()

		const dataList = (result && result.data && result.data.datas) || []
		list.value = list.value.concat(dataList)

		if (result && result.data && result.data.curPage >= result.data.pageCount - 1) {
			status.value = 'nomore'
		} else {
			status.value = 'loadmore'
		}
		isFirstLoad.value = false
	} catch (error) {
		console.error('获取体系详情失败', error)
		status.value = 'loadmore'
		uni.stopPullDownRefresh()
		isFirstLoad.value = false
	}
}

// 重新加载数据
const reloadData = () => {
	page.value = 0
	list.value = []
	isFirstLoad.value = true
	treeDetai(option.value)
}

// 打开页面
const openPage = (url, id, title) => {
	const titleParam = title ? '&title=' + encodeURIComponent(title) : ''
	uni.navigateTo({
		url: '/pages/web/index?url=' + encodeURIComponent(url) + '&id=' + id + titleParam
	})
}

// 点击列表项
const click = (index) => {
	const item = list.value[index]
	const url = item.link
	const id = item.id
	const title = item.title
	openPage(url, id, title)
}

// 生命周期
onLoad((opt) => {
	console.log(opt && opt.name)
	option.value = opt || {}
	uni.setNavigationBarTitle({
		title: (opt && opt.name) || '体系详情'
	})

	treeDetai(option.value)
})

// 上拉加载
onReachBottom(() => {
	console.log('上拉加载更多')
	if (status.value === 'nomore' || status.value === 'loading') {
		return
	}
	page.value++
	status.value = 'loading'
	treeDetai(option.value)
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

.cell-item {
	padding: 24rpx 32rpx;
	border-bottom: 1rpx solid #e5e5e5;
	position: relative;
}

.cell-item:last-child {
	border-bottom: none;
}

.cell-item:active {
	background-color: #f5f5f5;
}

.cell-title {
	font-size: 32rpx;
	color: #333;
	margin-bottom: 12rpx;
	line-height: 1.5;
}

.cell-label {
	font-size: 26rpx;
	color: #999;
	margin-bottom: 8rpx;
}

.cell-value {
	font-size: 26rpx;
	color: #2979FF;
}

.loadmore {
	padding: 24rpx;
	text-align: center;
	background-color: #fff;
}

.loadmore-text {
	font-size: 28rpx;
	color: #999;
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
