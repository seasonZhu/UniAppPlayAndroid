<template>
	<view class="container">
		<view v-if="list.length > 0" class="list">
			<view v-for="(item, index) in list" :key="index" class="article-item" @click="cellClick(index)">
				<view class="article-header">
					<view class="article-info">
						<text class="article-title">{{ formatTitle(item.title) }}</text>
						<view class="article-meta">
							<text class="author">{{ item.author || '匿名' }}</text>
							<text class="time">{{ item.niceDate }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view class="loadmore" v-if="!isFirstLoad && list.length > 0">
			<text v-if="status === 'loading'">加载中...</text>
			<text v-else-if="status === 'nomore'">没有更多了</text>
			<text v-else @click="loadmore">点击加载更多</text>
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
import { ref, watch } from 'vue'
import { onLoad, onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { api } from '@/config/http.js'

// Store
const userStore = useUserStore()
const { storeLogin } = userStore

// 数据
const list = ref([])
const page = ref(0)
const status = ref('loadmore')
const isFirstLoad = ref(true)

// 格式化标题
const formatTitle = (title) => {
	if (!title) return ''
	return title.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&quot;/g, '"')
		.replace(/&amp;/g, '&')
		.replace(/&ndash;/g, '–')
		.replace(/&mdash;/g, '—')
}

// 获取收藏列表
const getCollectArticleList = async (fromWatch = false) => {
	try {
		const result = await api.collectArticleList(page.value)
		const dataList = (result && result.data && result.data.datas) || []

		if (fromWatch) {
			list.value = dataList
		} else {
			list.value = list.value.concat(dataList)
		}

		if (result && result.data && result.data.pageCount == result.data.data.curPage) {
			status.value = 'nomore'
		} else {
			status.value = 'loadmore'
		}
		uni.stopPullDownRefresh()
		isFirstLoad.value = false
	} catch (error) {
		console.error('获取收藏列表失败', error)
		uni.stopPullDownRefresh()
		isFirstLoad.value = false
	}
}

// 重新加载数据
const reloadData = () => {
	page.value = 0
	isFirstLoad.value = true
	getCollectArticleList(true)
}

// 打开页面
const openPage = (url, id, title) => {
	const titleParam = title ? '&title=' + encodeURIComponent(title) : ''
	uni.navigateTo({
		url: '/pages/web/index?url=' + encodeURIComponent(url) + '&id=' + id + titleParam
	})
}

// 点击列表项
const cellClick = (index) => {
	const item = list.value[index]
	const url = item.link
	const id = item.originId
	const title = item.title
	openPage(url, id, title)
}

// 自动登录
const autoLogin = async () => {
	const userInfo = userStore.userInfo
	if (!userInfo.hasLogin) {
		return
	}

	const mobile = uni.getStorageSync('username')
	const code = uni.getStorageSync('password')

	if (mobile.length === 0 || code.length === 0) {
		return
	}

	try {
		const res = await api.login(mobile, code)
		if (typeof res === 'string') {
			uni.showToast({
				title: res,
				icon: 'none'
			})
			return
		}

		const temp = {
			cookie: 'loginUserName=' + mobile + ';' + 'loginUserPassword=' + code,
			profile: res
		}

		storeLogin(temp)
		uni.setStorageSync('username', mobile)
		uni.setStorageSync('password', code)

		await getCollectArticleList(true)
	} catch (error) {
		console.error('自动登录失败', error)
	}
}

// 加载更多
const loadmore = () => {
	page.value++
	status.value = 'loading'
	getCollectArticleList()
}

// 监听收藏ID变化
watch(() => userStore.userInfo.profile && userStore.userInfo.profile.collectIds, () => {
	getCollectArticleList(true)
})

// 下拉刷新
onPullDownRefresh(async () => {
	page.value = 0
	await getCollectArticleList(true)
})

// 生命周期
onLoad(() => {
	getCollectArticleList()
})

// 上拉加载
onReachBottom(() => {
	page.value++
	status.value = 'loading'
	getCollectArticleList()
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

.article-item {
	padding: 30rpx;
	border-bottom: 1rpx solid #f0f0f0;
}

.article-item:last-child {
	border-bottom: none;
}

.article-header {
	display: flex;
	flex-direction: column;
}

.article-info {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.article-title {
	font-size: 30rpx;
	color: #333;
	line-height: 1.5;
	margin-bottom: 10rpx;
	font-weight: 500;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.article-meta {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	align-items: center;
	margin-top: 10rpx;
}

.author {
	font-size: 24rpx;
	color: #999;
}

.time {
	font-size: 24rpx;
	color: #999;
}

.loadmore {
	padding: 30rpx;
	text-align: center;
	background-color: #fff;
}

.loadmore text {
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
