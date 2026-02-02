<template>
	<view class="container">
		<!-- 轮播图区域 -->
		<swiper v-if="list.length > 0" class="banner" indicator-dots circular autoplay interval="3000">
			<swiper-item v-for="(item, index) in list" :key="index">
				<image :src="item.imagePath" mode="widthFix" class="banner-image" @click="onBannerClick(index)"></image>
			</swiper-item>
		</swiper>

		<!-- 置顶文章列表 -->
		<view v-if="tops.length > 0" class="section">
			<view class="section-title">置顶文章</view>
			<view v-for="(item, index) in tops" :key="index" class="article-item" @click="onArticleClick(item, index)">
				<view class="article-title">{{ formatTitle(item.title) }}</view>
				<view class="article-meta">
					<text class="author">{{ item.author || '匿名' }}</text>
					<text class="time">{{ item.niceDate || '刚刚' }}</text>
				</view>
			</view>
		</view>

		<!-- 普通文章列表 -->
		<view v-if="normals.length > 0" class="section">
			<view class="section-title">最新文章</view>
			<view v-for="(item, index) in normals" :key="index" class="article-item" @click="onNormalClick(item, index)">
				<view class="article-title">{{ formatTitle(item.title) }}</view>
				<view class="article-meta">
					<text class="author">{{ item.author || '匿名' }}</text>
					<text class="time">{{ item.niceDate || '刚刚' }}</text>
				</view>
			</view>
		</view>

		<!-- 加载状态 -->
		<view v-if="!isFirstLoad && normals.length > 0" class="loadmore" @click="loadMore">
			<text v-if="status === 'loading'">加载中...</text>
			<text v-else-if="status === 'nomore'">没有更多了</text>
			<text v-else>{{ statusText }}</text>
		</view>

		<!-- 空状态 -->
		<view v-if="!isFirstLoad && list.length === 0 && tops.length === 0 && normals.length === 0" class="empty-state" @click="reload">
			<view class="empty-icon">📭</view>
			<text class="empty-text">暂无数据</text>
			<text class="empty-tip">点击屏幕重新加载</text>
		</view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onPullDownRefresh, onReachBottom, onNavigationBarButtonTap } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { api } from '@/config/http.js'

const userStore = useUserStore()

// 数据
const list = ref([])
const tops = ref([])
const normals = ref([])
const page = ref(0)
const status = ref('loadmore')
const isFirstLoad = ref(true) // 首次加载状态

// 计算属性
const statusText = computed(() => {
	const statusMap = {
		'loadmore': '点击加载更多',
		'loading': '加载中...',
		'nomore': '没有更多了'
	}
	return statusMap[status.value] || '加载更多'
})

// 获取轮播图
const getBanner = async () => {
	try {
		const result = await api.banner()
		console.log('轮播图原始数据:', result)
		// API返回格式: {data: [...], errorCode: 0, errorMsg: ""}
		list.value = (result && result.data) || []
		console.log('轮播图处理后数据:', list.value)
	} catch (error) {
		console.error('获取轮播图失败:', error)
		list.value = []
	}
}

// 获取置顶文章
const getTopArticle = async () => {
	try {
		const result = await api.top()
		console.log('置顶文章原始数据:', result)
		tops.value = (result && result.data) || []
		console.log('置顶文章处理后数据:', tops.value)
	} catch (error) {
		console.error('获取置顶文章失败:', error)
		tops.value = []
	}
}

// 获取普通文章
const getNormalArticle = async (isRefresh = false) => {
	try {
		console.log('开始获取普通文章, 页码:', page.value, '是否刷新:', isRefresh)
		const result = await api.normal(page.value)
		console.log('普通文章原始数据:', result)

		const dataList = (result && result.data && result.data.datas) || []
		console.log('解析后的数据列表长度:', dataList.length)

		// 根据是否是刷新模式来处理数据
		if (isRefresh) {
			// 刷新模式：直接替换
			normals.value = dataList
			console.log('刷新模式：替换数据，当前文章数:', normals.value.length)
		} else {
			// 加载更多模式：追加
			// 如果是第一页(page=0)且数据为空，直接赋值
			if (page.value === 0 && normals.value.length === 0) {
				normals.value = dataList
				console.log('初始加载：直接赋值数据，文章数:', normals.value.length)
			} else {
				normals.value = normals.value.concat(dataList)
				console.log('加载更多：追加数据，当前文章总数:', normals.value.length)
			}
		}

		if (result && result.data && result.data.pageCount == result.data.curPage) {
			status.value = 'nomore'
		} else {
			status.value = 'loadmore'
		}
		console.log('普通文章加载完成，状态:', status.value)
	} catch (error) {
		console.error('获取文章失败:', error)
		status.value = 'loadmore'
	}
}

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

// 轮播图点击
const onBannerClick = (index) => {
	const item = list.value[index]
	if (item && item.url) {
		uni.navigateTo({
			url: '/pages/web/banner-web?url=' + encodeURIComponent(item.url) + '&id=' + item.id + '&title=' + encodeURIComponent(item.title || '')
		})
	}
}

// 置顶文章点击
const onArticleClick = (item, index) => {
	openArticle(item)
}

// 普通文章点击
const onNormalClick = (item, index) => {
	openArticle(item)
}

// 打开文章
const openArticle = (item) => {
	if (item && item.link) {
		uni.navigateTo({
			url: '/pages/web/index?url=' + encodeURIComponent(item.link) + '&id=' + item.id + '&title=' + encodeURIComponent(item.title || '')
		})
	}
}

// 加载更多
const loadMore = () => {
	if (status.value === 'nomore' || status.value === 'loading') {
		return
	}
	page.value++
	status.value = 'loading'
	getNormalArticle(false)
}

// 重新加载
const reload = () => {
	list.value = []
	tops.value = []
	normals.value = []
	page.value = 0
	status.value = 'loadmore'
	getBanner()
	getTopArticle()
}

// 自动登录
const autoLogin = async () => {
	if (userStore.userInfo.hasLogin) {
		return
	}

	const mobile = uni.getStorageSync('username')
	const code = uni.getStorageSync('password')

	if (!mobile || !code) {
		return
	}

	try {
		const result = await api.login(mobile, code)
		if (typeof result === 'string') {
			console.log('登录失败:', result)
			return
		}

		console.log('自动登录成功')
		const temp = {
			cookie: 'loginUserName=' + mobile + ';loginUserPassword=' + code,
			profile: result
		}

		userStore.storeLogin(temp)
		uni.setStorageSync('username', mobile)
		uni.setStorageSync('password', code)
	} catch (error) {
		console.error('自动登录失败:', error)
	}
}

// 生命周期
onLoad(() => {
	console.log('=== 首页开始加载 ===')
	console.log('当前页码:', page.value)
	console.log('当前状态:', status.value)

	// 按顺序加载数据
	getBanner()
		.then(() => {
			console.log('轮播图加载完成')
			return getTopArticle()
		})
		.then(() => {
			console.log('置顶文章加载完成')
			return getNormalArticle() // 加载普通文章列表
		})
		.then(() => {
			console.log('普通文章加载完成')
			console.log('=== 首页数据加载完毕 ===')
			// 首次加载完成
			isFirstLoad.value = false
		})
		.catch(error => {
			console.error('首页加载失败:', error)
			// 首次加载完成
			isFirstLoad.value = false
		})

	autoLogin()
})

// 下拉刷新
onPullDownRefresh(async () => {
	console.log('下拉刷新')
	// 重置数据
	tops.value = []
	normals.value = []
	page.value = 0
	status.value = 'loadmore'

	// 重新加载数据
	await getBanner()
	await getTopArticle()
	await getNormalArticle(true) // 刷新模式

	uni.stopPullDownRefresh()
})

onReachBottom(() => {
	page.value++
	status.value = 'loading'
	getNormalArticle(false)
})

onNavigationBarButtonTap(() => {
	uni.navigateTo({
		url: '/pages/index/search'
	})
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
	min-height: 100vh;
	background-color: #f5f5f5;
}

.banner {
	height: 450rpx;
	background-color: #fff;
	margin-bottom: 20rpx;
}

.banner-image {
	width: 100%;
	height: 100%;
}

.section {
	background-color: #fff;
	margin-bottom: 20rpx;
	padding: 20rpx;
}

.section-title {
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	margin-bottom: 20rpx;
	padding-bottom: 10rpx;
	border-bottom: 1rpx solid #eee;
}

.article-item {
	padding: 30rpx 0;
	border-bottom: 1rpx solid #f0f0f0;
}

.article-item:last-child {
	border-bottom: none;
}

.article-title {
	font-size: 28rpx;
	color: #333;
	line-height: 1.6;
	margin-bottom: 10rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

.article-meta {
	display: flex;
	justify-content: space-between;
	align-items: center;
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
	color: #2979FF;
	font-size: 28rpx;
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
