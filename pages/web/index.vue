<template>
	<view>
		<!-- 自定义底部弹窗 -->
		<view class="popup-mask" v-if="show" @click="show = false">
			<view class="popup-content" @click.stop>
				<view class="popup-item" v-for="(item, index) in list" :key="index" @click="click(index)">
					<text class="popup-text">{{ item }}</text>
				</view>
			</view>
		</view>
		<!-- #ifdef APP-PLUS -->
		<web-view :src="decodedUrl"></web-view>
		<!-- #endif -->
		<!-- #ifndef APP-PLUS -->
		<web-view :src="decodedUrl" :update-title="false"></web-view>
		<!-- #endif -->
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad, onNavigationBarButtonTap, onUnload } from '@dcloudio/uni-app'
import { useUserStore } from '@/stores/user.js'
import { api } from '@/config/http.js'

// Store
const userStore = useUserStore()
const { storeLogin } = userStore

// 数据
const params = ref({})
const show = ref(false)
const staticList = ['复制链接', '浏览器打开', '微信分享', '刷新']
const marqueeTimer = ref(null) // 走马灯定时器
const originalTitle = ref('') // 原始标题

/**
 * 计算标题的显示宽度（中文字符按2个字符计算）
 * @param {String} title - 标题文本
 * @returns {Number} 计算后的宽度值
 */
const calculateTitleWidth = (title) => {
	if (!title) return 0
	let width = 0
	for (let i = 0; i < title.length; i++) {
		const char = title.charAt(i)
		// 中文字符、中文标点符号按2个宽度计算
		if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
			width += 2
		} else {
			// 英文、数字、符号按1个宽度计算
			width += 1
		}
	}
	return width
}

/**
 * 启动标题走马灯效果
 * @param {String} title - 完整标题
 */
const startTitleMarquee = (title) => {
	originalTitle.value = title

	if (!title) {
		uni.setNavigationBarTitle({ title: '详细' })
		return
	}

	// 计算标题宽度，相当于25个英文字符的宽度（约50个字符宽度）
	const titleWidth = calculateTitleWidth(title)
	const maxDisplayWidth = 26 // 增加到26个英文字符宽度

	// 标题宽度较小时直接显示
	if (titleWidth <= maxDisplayWidth) {
		uni.setNavigationBarTitle({ title: title })
		return
	}

	// 需要跑马灯效果
	let displayIndex = 0

	/**
	 * 执行走马灯滚动
	 */
	const marquee = () => {
		let displayTitle = ''
		let currentWidth = 0
		let i = displayIndex

		// 从当前索引开始，累积字符直到达到最大显示宽度
		while (currentWidth < maxDisplayWidth && i < title.length) {
			const char = title.charAt(i)
			// 中文字符按2个宽度计算
			if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
				currentWidth += 2
			} else {
				currentWidth += 1
			}
			displayTitle += char
			i++
		}

		// 如果剩余字符不足，从开头补充
		if (currentWidth < maxDisplayWidth) {
			let j = 0
			while (currentWidth < maxDisplayWidth && j < displayIndex) {
				const char = title.charAt(j)
				if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
					currentWidth += 2
				} else {
					currentWidth += 1
				}
				displayTitle += char
				j++
			}
		}

		// 添加省略号提示，表示滚动效果
		if (titleWidth > maxDisplayWidth) {
			displayTitle = displayTitle.slice(0, -1) + '…'
		}

		uni.setNavigationBarTitle({ title: displayTitle })

		// 更新下一次显示的起始位置
		displayIndex = (displayIndex + 1) % title.length
	}

	// 立即执行一次
	marquee()

	// 启动定时器，每500ms滚动一次
	marqueeTimer.value = setInterval(marquee, 500)
}

/**
 * 停止标题走马灯
 */
const stopTitleMarquee = () => {
	if (marqueeTimer.value) {
		clearInterval(marqueeTimer.value)
		marqueeTimer.value = null
	}
	// 恢复原始标题
	if (originalTitle.value) {
		uni.setNavigationBarTitle({ title: originalTitle.value })
	}
}

// 计算属性
const userInfo = computed(() => userStore.userInfo)

// 解码URL - 解决重复编码问题
const decodedUrl = computed(() => {
	const rawUrl = params.value.url || ''
	console.log('原始URL参数:', rawUrl)
	// URL已经被encodeURIComponent编码，需要解码
	const decoded = decodeURIComponent(rawUrl)
	console.log('解码后URL:', decoded)
	return decoded
})

const collectIds = computed(() => {
	return userInfo.value.profile && userInfo.value.profile.collectIds || []
})

const id = computed(() => {
	return Number(params.value.id)
})

const hasCollected = computed(() => {
	let array = collectIds.value
	let articleId = id.value
	return array.includes(articleId)
})

const list = computed(() => {
	if (userInfo.value.hasLogin) {
		let text = hasCollected.value ? '取消收藏' : '收藏'
		let array = ['复制链接', '浏览器打开', '微信分享', '刷新']
		array.push(text)
		return array
	} else {
		return staticList
	}
})

// 方法
const click = (index) => {
	show.value = false
	console.log(index)
	switch (index) {
		case 0:
			// 复制链接
			copyUrl()
			break
		case 1:
			// 浏览器打开
			openInBrowser()
			break
		case 4:
			actionCollectedOrUnCollected()
			break
		default:
			break
	}
}

// 复制链接
const copyUrl = () => {
	const url = decodedUrl.value
	uni.setClipboardData({
		data: url,
		success: () => {
			uni.showToast({
				title: '链接已复制',
				icon: 'success'
			})
		}
	})
}

// 浏览器打开
const openInBrowser = () => {
	// plus.runtime.openURL 在App环境可用
	// #ifdef APP-PLUS
	plus.runtime.openURL(decodedUrl.value)
	// #endif
	// #ifndef APP-PLUS
	uni.showModal({
		title: '提示',
		content: 'H5环境不支持直接打开外部浏览器',
		showCancel: false
	})
	// #endif
}

const actionCollectedOrUnCollected = async () => {
	try {
		if (hasCollected.value) {
			await api.actionUnCollected(id.value)
		} else {
			await api.actionCollected(id.value)
		}
		// 刷新用户信息
		await autoLogin()
	} catch (error) {
		console.error('收藏操作失败', error)
		if (error === undefined) {
			await autoLogin()
		}
	}
}

const autoLogin = async () => {
	if (!userInfo.value.hasLogin) {
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
	} catch (error) {
		console.error('自动登录失败', error)
	}
}

// 生命周期
onLoad((option) => {
	params.value = option || {}
	console.log('WebView参数:', option)
	console.log('文章ID:', option && option.id)
	console.log('URL参数:', option && option.url)

	// 获取标题参数并解码
	const encodedTitle = option && option.title
	if (encodedTitle) {
		const decodedTitle = decodeURIComponent(encodedTitle)
		console.log('解码后标题:', decodedTitle)
		startTitleMarquee(decodedTitle)
	}
})

onNavigationBarButtonTap((e) => {
	console.log(e && e.float)
	show.value = true
})

// 页面卸载时清除定时器
onUnload(() => {
	stopTitleMarquee()
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
.popup-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	display: flex;
	flex-direction: column;
	justify-content: flex-end;
	z-index: 9999;
}

.popup-content {
	background-color: #fff;
	border-radius: 24rpx 24rpx 0 0;
	padding-bottom: env(safe-area-inset-bottom);
}

.popup-item {
	padding: 32rpx;
	text-align: center;
	border-bottom: 1rpx solid #e5e5e5;
}

.popup-item:last-child {
	border-bottom: none;
}

.popup-item:active {
	background-color: #f5f5f5;
}

.popup-text {
	font-size: 32rpx;
	color: #333;
}
</style>
