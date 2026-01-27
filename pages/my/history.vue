<template>
	<view class="container">
		<view v-if="list.length > 0" class="list">
			<view v-for="(item, index) in list" :key="index">
				<history-cell :item="item"></history-cell>
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
const page = ref(1)
const status = ref('loadmore')
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

// 获取积分历史
const getMyCoinList = async () => {
	try {
		const result = await api.myCoinList(page.value)
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
		console.error('获取积分历史失败', error)
		status.value = 'loadmore'
		uni.stopPullDownRefresh()
		isFirstLoad.value = false
	}
}

// 重新加载数据
const reloadData = () => {
	page.value = 1
	list.value = []
	isFirstLoad.value = true
	getMyCoinList()
}

// 生命周期
onLoad(() => {
	getMyCoinList()
})

// 上拉加载
onReachBottom(() => {
	console.log('上拉加载更多')
	if (status.value === 'nomore' || status.value === 'loading') {
		return
	}
	page.value++
	status.value = 'loading'
	getMyCoinList()
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
