<template>
	<view>
		<web-view :src="decodedUrl"></web-view>
	</view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 数据
const params = ref({})
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
		uni.setNavigationBarTitle({ title: '详情' })
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

// 计算属性 - 解码URL解决重复编码问题
const decodedUrl = computed(() => {
	const rawUrl = params.value.url || ''
	console.log('Banner原始URL参数:', rawUrl)
	// URL已经被encodeURIComponent编码，需要解码
	const decoded = decodeURIComponent(rawUrl)
	console.log('Banner解码后URL:', decoded)
	return decoded
})

// 生命周期
onLoad((option) => {
	params.value = option || {}
	console.log('Banner WebView参数:', option)

	// 获取标题参数并解码
	const encodedTitle = option && option.title
	if (encodedTitle) {
		const decodedTitle = decodeURIComponent(encodedTitle)
		console.log('Banner解码后标题:', decodedTitle)
		startTitleMarquee(decodedTitle)
	}
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

<style>
</style>
