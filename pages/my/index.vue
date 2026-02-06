<template>
	<view>
		<image class="header" :src="userHeadImageName" mode="widthFix" @tap="selectImage"></image>
		<text class="myCoioStyle" v-if="userInfo.hasLogin">{{ coinText }}</text>
		<view class="cell-item" @click="click(0)">
			<text class="cell-title">体系</text>
			<text class="cell-arrow">›</text>
		</view>
		<view class="cell-item" @click="click(1)">
			<text class="cell-title">积分排行榜</text>
			<text class="cell-arrow">›</text>
		</view>
		<view class="cell-item" v-if="userInfo.hasLogin" @click="click(2)">
			<text class="cell-title">我的积分历史</text>
			<text class="cell-arrow">›</text>
		</view>
		<view class="cell-item" v-if="userInfo.hasLogin" @click="click(3)">
			<text class="cell-title">我的收藏</text>
			<text class="cell-arrow">›</text>
		</view>
		<view class="cell-item" @click="click(4)">
			<text class="cell-title">调用原生方法</text>
			<text class="cell-arrow">›</text>
		</view>
		<view class="cell-item" @click="click(5)">
			<text class="cell-title">调用原生页面</text>
			<text class="cell-arrow">›</text>
		</view>
		<view class="cell-item" @click="click(6)">
			<text class="cell-title">调用HarmonyOS Next原生页面</text>
			<text class="cell-arrow">›</text>
		</view>
		<!-- 暂时移除 uniCloud 检查更新功能，待升级插件后再启用 -->
		<text class="loginOrlogoutStyle" @tap="loginOrlogout">{{ loginStatusText }}</text>

		<!-- 自定义弹窗 -->
		<view class="modal-mask" v-if="show" @click="show = false">
			<view class="modal-content" @click.stop>
				<view class="modal-title">提示</view>
				<view class="modal-body">是否登出？</view>
				<view class="modal-footer">
					<view class="modal-btn modal-btn-cancel" @click="show = false">取消</view>
					<view class="modal-btn modal-btn-confirm" @click="sureLogout">确定</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { onReady, onLoad, onPullDownRefresh } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { api } from '@/config/http.js'

// Store
const userStore = useUserStore()
const { storeLogout, initUserInfo } = userStore

// 初始化用户信息
initUserInfo()

// 数据
const show = ref(false)
const coinInfo = ref({
	coinCount: '--',
	level: '--',
	rank: '--',
})

// 计算属性
const userInfo = computed(() => userStore.userInfo)

const coinText = computed(() => {
	const rank = coinInfo.value.rank || '--'
	const level = coinInfo.value.level || '--'
	const coinCount = coinInfo.value.coinCount || '--'
	return '排名: ' + rank + '  等级: ' + level + '  积分: ' + coinCount
})

const userHeadImageName = computed(() => {
	if (userInfo.value.hasLogin) {
		return '/static/user/saber.jpg'
	} else {
		return '/static/uview/common/logo.png'
	}
})

const loginStatusText = computed(() => {
	if (userInfo.value.hasLogin) {
		return '退出登录'
	} else {
		return '登录'
	}
})

// 监听登录状态变化
watch(() => userInfo.value.hasLogin, (newValue) => {
	console.log("监听器起作用了")
	if (newValue === true) {
		getUserCoinInfo()
	}
})

// 方法
const click = (index) => {
	switch (index) {
		case 0:
			uni.navigateTo({ url: '/pages/my/tree' })
			break
		case 1:
			uni.navigateTo({ url: '/pages/my/ranking' })
			break
		case 2:
			uni.navigateTo({ url: '/pages/my/history' })
			break
		case 3:
			uni.navigateTo({ url: '/pages/my/collection' })
			break
		case 4:
			uni.navigateTo({ url: '/pages/my/callNativeMethod' })
			break
		case 5:
			uni.navigateTo({ url: '/pages/my/nativeMapComponent' })
			break
		case 6:
			uni.navigateTo({ url: '/pages/my/harmonyOSNextComponent' })
			break
		default:
			break
	}
}

const loginOrlogout = () => {
	if (userInfo.value.hasLogin) {
		show.value = true
	} else {
		uni.navigateTo({ url: '/pages/login/index' })
	}
}

const sureLogout = async () => {
	try {
		const res = await api.logout()
		show.value = false
		if (typeof res === 'string') {
			uni.showToast({
				title: res,
				icon: 'none'
			})
			return
		}
		storeLogout()
		uni.showToast({
			title: '已退出登录',
			icon: 'success'
		})
	} catch (error) {
		console.error('登出失败', error)
		show.value = false
	}
}

const getUserCoinInfo = async () => {
	if (userInfo.value.hasLogin) {
		try {
			const result = await api.userCoinInfo()
			uni.stopPullDownRefresh()
			// API返回 {data: {...}, errorCode: 0, errorMsg: ""}
			coinInfo.value = (result && result.data) || result
			console.log('积分信息:', coinInfo.value)
		} catch (error) {
			console.error('获取积分信息失败', error)
			uni.stopPullDownRefresh()
		}
	} else {
		uni.stopPullDownRefresh()
	}
}

const selectImage = () => {
	console.log("点击了图片")
}

// 生命周期
onReady(() => {
	// checkUpdate 功能暂时移除
	// checkUpdate()
})

onLoad(() => {
	getUserCoinInfo()
})

// 下拉刷新
onPullDownRefresh(async () => {
	console.log('下拉刷新我的页面')
	// 重置积分信息
	coinInfo.value = {
		coinCount: '--',
		level: '--',
		rank: '--',
	}
	// 重新获取数据
	await getUserCoinInfo()
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
.header {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	height: 200rpx;
	width: 200rpx;
	margin-top: 50rpx;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 50rpx;
	border-radius: 100rpx;
}

.text-area {
	display: flex;
	justify-content: center;
}

.title {
	font-size: 36rpx;
	color: #8f8f94;
}

.cell-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: space-between;
	padding: 24rpx 32rpx;
	background-color: #fff;
	border-bottom: 1rpx solid #e5e5e5;
}

.cell-item:active {
	background-color: #f5f5f5;
}

.cell-item .cell-title {
	font-size: 32rpx;
	color: #333;
}

.cell-item .cell-arrow {
	font-size: 48rpx;
	color: #999;
	font-weight: 300;
}

.loginOrlogoutStyle {
	margin-top: 100rpx;
	margin-left: 32rpx;
	margin-right: 32rpx;
	height: 88rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background-color: #2979FF;
	color: #FFFFFF;
	border-radius: 8rpx;
	font-size: 32rpx;
}

.myCoioStyle {
	height: 88rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	font-size: 28rpx;
	color: #666;
}

.modal-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 9999;
}

.modal-content {
	width: 560rpx;
	background-color: #fff;
	border-radius: 16rpx;
	overflow: hidden;
}

.modal-title {
	padding: 32rpx;
	text-align: center;
	font-size: 32rpx;
	font-weight: bold;
	color: #333;
	border-bottom: 1rpx solid #e5e5e5;
}

.modal-body {
	padding: 48rpx 32rpx;
	text-align: center;
	font-size: 28rpx;
	color: #666;
}

.modal-footer {
	display: flex;
	flex-direction: row;
	border-top: 1rpx solid #e5e5e5;
}

.modal-btn {
	flex: 1;
	height: 88rpx;
	line-height: 88rpx;
	text-align: center;
	font-size: 32rpx;
}

.modal-btn-cancel {
	color: #666;
	border-right: 1rpx solid #e5e5e5;
}

.modal-btn-confirm {
	color: #2979FF;
	font-weight: bold;
}
</style>
