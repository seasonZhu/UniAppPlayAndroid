<script setup>
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'

// 应用启动
onLaunch((launchInfo) => {
	const title = (launchInfo && launchInfo.referrerInfo && launchInfo.referrerInfo.extraData && launchInfo.referrerInfo.extraData.arguments) || 'App启动'

	uni.showToast({
		title: title,
		icon: 'none',
		position: 'top'
	})

	// 监听原生事件（仅在 App 平台支持）
	// #ifdef APP-PLUS
	if (typeof uni.onNativeEventReceive === 'function') {
		uni.onNativeEventReceive((event, data) => {
			console.log('接收到宿主App消息：' + event + data)
			let nativeMsg = '接收到宿主App消息 event：' + event + " data: " + data
			uni.showToast({
				title: nativeMsg,
				icon: 'none',
				position: 'top'
			})
		})
	}
	// #endif
})

// 应用显示
onShow(() => {
	console.log('App Show')
})

// 应用隐藏
onHide(() => {
	console.log('App Hide')
})
</script>

<style>
/* 全局样式 */
page {
	background-color: #f5f5f5;
}
</style>
