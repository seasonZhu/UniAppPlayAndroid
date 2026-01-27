<template>
	<view>
		<button type="primary" class="buttonStyle" @click="testAsyncFunc">testAsyncFunc</button>
		<button type="primary" class="buttonStyle" @click="testSyncFunc">testSyncFunc</button>
		<button type="primary" class="buttonStyle" @click="uniAppSendMessageToNative">uniAppSendMessageToNative</button>
		<button type="primary" class="buttonStyle" @click="closeUniApp">closeUniApp</button>
	</view>
</template>

<script setup>
import { getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 获取 module
const testModule = uni.requireNativePlugin("TestModule")

// 获取当前实例
const instance = getCurrentInstance()

// 测试异步方法
const testAsyncFunc = () => {
	testModule.testAsyncFunc({
		'name': 'unimp',
		'age': 1
	},
	(ret) => {
		console.log(ret)
	})
}

// 测试同步方法
const testSyncFunc = () => {
	const ret = testModule.testSyncFunc({
		'name': 'unimp',
		'age': 1
	})
	console.log(ret)
}

// 发送消息到原生
const uniAppSendMessageToNative = () => {
	uni.sendNativeEvent('unimp-event', {
		msg: 'unimp message!!!'
	}, ret => {
		const nativeMsg = '宿主App回传的数据：' + ret
		uni.showToast({
			title: nativeMsg,
			icon: 'none',
			position: 'top'
		})
	})
}

// 关闭 uniApp
const closeUniApp = () => {
	// #ifdef APP-PLUS
	plus.runtime.quit()
	// #endif
}

// 生命周期
onLoad((e) => {
	// #ifdef APP-PLUS
	// 判断是否为启动直达页面
	if (e && e.action === "redirect") {
		const currentWebview = instance && instance.proxy && instance.proxy.$scope && instance.proxy.$scope.$getAppWebview()
		if (currentWebview && currentWebview.setStyle) {
			currentWebview.setStyle({
				popGesture: 'none', // 取消手势返回
				titleNView: {
					autoBackButton: false // 取消默认返回按钮
				}
			})
		}
	}
	// #endif
})
</script>

<style>
.buttonStyle {
	margin-top: 20rpx;
	margin-left: 20rpx;
	margin-right: 20rpx;
	height: 88rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background-color: #2979FF;
	color: #FFFFFF;
}
</style>
