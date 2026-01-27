<template>
	<view class="container">
		<!-- 顶部tab栏 -->
		<scroll-view class="tabs-container" scroll-x scroll-with-animation>
			<view class="tabs">
				<view
					v-for="(tab, index) in topics"
					:key="index"
					class="tab-item"
					:class="{ active: current === index }"
					@click="onTabClick(index)"
				>
					<text class="tab-text">{{ tab.name }}</text>
					<view v-if="current === index" class="tab-indicator"></view>
				</view>
			</view>
		</scroll-view>

		<!-- 内容区域 -->
		<swiper class="content-swiper" :current="current" @change="onSwiperChange">
			<swiper-item v-for="(tab, index) in topics" :key="index" class="swiper-item">
				<scroll-view
					class="scroll-content"
					scroll-y
					@scrolltolower="onReachBottom"
					:refresher-enabled="true"
					:refresher-triggered="refreshing[index] || false"
					@refresherrefresh="onRefresh(index)"
					@refresherrestore="onRestore(index)"
					refresher-background="#f5f5f5"
				>
					<!-- 文章列表 -->
					<view v-if="lists[index] && lists[index].length > 0" class="list">
						<view
							v-for="(item, idx) in lists[index]"
							:key="idx"
							class="article-item"
							@click="onArticleClick(index, idx)"
						>
							<view class="article-header">
								<view class="article-info">
									<text class="article-title">{{ item.title }}</text>
									<view class="article-meta">
										<text class="author">{{ item.author || item.shareUser || '匿名' }}</text>
										<text class="time">{{ item.niceDate }}</text>
									</view>
								</view>
							</view>
							<view v-if="item.desc" class="article-desc">{{ item.desc }}</view>
						</view>
					</view>

					<!-- 加载状态 -->
					<view v-if="!isFirstLoad[index] && lists[index] && lists[index].length > 0" class="loadmore">
						<text v-if="listStatus[index] === 'loading'">加载中...</text>
						<text v-else-if="listStatus[index] === 'nomore'">没有更多了</text>
						<text v-else-if="listStatus[index] === 'loadmore'" @click="loadMore">点击加载更多</text>
					</view>

					<!-- 空状态 -->
					<view v-if="!isFirstLoad[index] && (!lists[index] || lists[index].length === 0)" class="empty-state" @click="onRefresh(index)">
						<view class="empty-icon">📭</view>
						<text class="empty-text">暂无数据</text>
						<text class="empty-tip">点击屏幕重新加载</text>
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '@/config/http.js'

// 数据
const topics = ref([])
const current = ref(0)
const lists = ref([])
const pages = ref([])
const listStatus = ref([])
const refreshing = ref([]) // 每个tab的刷新状态
const isFirstLoad = ref([]) // 每个tab的首次加载状态

// 获取公众号分类
const getPublicNumTopic = async () => {
	try {
		const result = await api.publicNumTopic()
		topics.value = (result && result.data) || []

		// 初始化每个tab的数据
		for (let i = 0; i < topics.value.length; i++) {
			pages.value[i] = 0
			lists.value[i] = []
			listStatus.value[i] = 'loadmore'
			refreshing.value[i] = false
			isFirstLoad.value[i] = true
		}

		// 加载前两个tab的数据（原代码行为）
		if (topics.value.length > 0) {
			await getPublicNumList(0)
			if (topics.value.length > 1) {
				await getPublicNumList(1)
			}
		}
	} catch (error) {
		console.error('获取公众号分类失败:', error)
		uni.stopPullDownRefresh()
	}
}

// 获取公众号文章列表
const getPublicNumList = async (index, isLoadMore = false) => {
	const status = listStatus.value[index]
	if (status === 'nomore' || status === 'loading') {
		return
	}

	const model = topics.value[index]
	if (!model) return

	const id = model.id
	let page
	if (isLoadMore) {
		page = pages.value[index] + 1
		pages.value[index] = page
	} else {
		page = pages.value[index]
	}

	try {
		listStatus.value[index] = 'loading'
		const result = await api.publicNumList(id, page)
		const dataList = (result && result.data && result.data.datas) || []

		if (isLoadMore) {
			lists.value[index] = lists.value[index].concat(dataList)
		} else {
			lists.value[index] = dataList
		}

		// 更新状态
		if (result && result.data && result.data.curPage >= result.data.pageCount - 1) {
			listStatus.value[index] = 'nomore'
		} else if (dataList.length === 0) {
			listStatus.value[index] = 'nomore'
		} else {
			listStatus.value[index] = 'loadmore'
		}
	} catch (error) {
		console.error('获取公众号文章列表失败:', error)
		listStatus.value[index] = 'loadmore'
	} finally {
		// 结束刷新
		refreshing.value[index] = false
		// 首次加载完成
		isFirstLoad.value[index] = false
	}
}

// 下拉刷新
const onRefresh = (index) => {
	refreshing.value[index] = true
	isFirstLoad.value[index] = false
	pages.value[index] = 0
	getPublicNumList(index)
}

// 刷新恢复
const onRestore = (index) => {
	refreshing.value[index] = false
}

// 点击tab
const onTabClick = (index) => {
	current.value = index
	// 如果该tab还没有数据，则加载
	if (!lists.value[index] || lists.value[index].length === 0) {
		getPublicNumList(index)
	}
}

// swiper切换
const onSwiperChange = (e) => {
	const index = e.detail.current
	current.value = index
	// 如果该tab还没有数据，则加载
	if (!lists.value[index] || lists.value[index].length === 0) {
		getPublicNumList(index)
	}
}

// 上拉加载
const onReachBottom = () => {
	const index = current.value
	if (listStatus.value[index] !== 'nomore' && listStatus.value[index] !== 'loading') {
		getPublicNumList(index, true)
	}
}

// 加载更多
const loadMore = () => {
	const index = current.value
	getPublicNumList(index, true)
}

// 打开文章详情
const openPage = (url, id, title) => {
	const titleParam = title ? '&title=' + encodeURIComponent(title) : ''
	uni.navigateTo({
		url: '/pages/web/index?url=' + encodeURIComponent(url) + '&id=' + id + titleParam
	})
}

// 点击文章
const onArticleClick = (index, idx) => {
	const item = lists.value[index][idx]
	if (item && item.link) {
		openPage(item.link, item.id, item.title)
	}
}

// 生命周期
onLoad(() => {
	getPublicNumTopic()
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
	display: flex;
	flex-direction: column;
	height: 100vh;
	background-color: #f5f5f5;
}

/* Tab栏 */
.tabs-container {
	background-color: #fff;
	border-bottom: 1rpx solid #eee;
	white-space: nowrap;
}

.tabs {
	display: flex;
	flex-direction: row;
	padding: 0 20rpx;
}

.tab-item {
	position: relative;
	padding: 30rpx 20rpx;
	display: inline-flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	writing-mode: horizontal-tb;
}

.tab-text {
	font-size: 28rpx;
	color: #666;
	white-space: nowrap;
	display: block;
}

.tab-item.active .tab-text {
	color: #2979FF;
	font-weight: bold;
}

.tab-indicator {
	position: absolute;
	bottom: 0;
	left: 50%;
	transform: translateX(-50%);
	width: 40rpx;
	height: 4rpx;
	background-color: #2979FF;
	border-radius: 2rpx;
}

/* 内容区域 */
.content-swiper {
	flex: 1;
	height: 0;
}

.swiper-item {
	height: 100%;
}

.scroll-content {
	height: 100%;
}

/* 文章列表 */
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

.article-desc {
	font-size: 26rpx;
	color: #666;
	line-height: 1.6;
	margin-top: 20rpx;
	display: -webkit-box;
	-webkit-box-orient: vertical;
	-webkit-line-clamp: 2;
	overflow: hidden;
}

/* 加载状态 */
.loadmore {
	padding: 30rpx;
	text-align: center;
	background-color: #fff;
}

.loadmore text {
	font-size: 28rpx;
	color: #999;
}

/* 空状态 */
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
