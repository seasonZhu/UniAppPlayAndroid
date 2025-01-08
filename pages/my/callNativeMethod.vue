<template>
	<view>
		<button type="primary" class="buttonStyle" @click="testAsyncFunc">testAsyncFunc</button>
		<button type="primary" class="buttonStyle" @click="testSyncFunc">testSyncFunc</button>
		<button type="primary" class="buttonStyle" @click="uniAppSendMessageToNative">uniAppSendMessageToNative</button>
		<button type="primary" class="buttonStyle" @click="closeUniApp">closeUniApp</button>
	</view>
</template>

<script>
	// 获取 module
	var testModule = uni.requireNativePlugin("TestModule")
	export default {
		onLoad(e) {
			// #ifdef APP-PLUS
			// 判断是否为启动直达页面
			if (e.action === "redirect") {
				const currentWebview = this.$scope.$getAppWebview();
				currentWebview.setStyle({
					popGesture: 'none', // 取消手势返回
					titleNView: { 
						autoBackButton: false // 取消默认返回按钮
					}
				})
			}
			// #endif
		},
		methods: {
			testAsyncFunc() {
				// 调用异步方法
				testModule.testAsyncFunc({
						'name': 'unimp',
						'age': 1
					},
					(ret) => {
						console.log(ret)
					})
			},
			testSyncFunc() {
				// 调用同步方法
				var ret = testModule.testSyncFunc({
					'name': 'unimp',
					'age': 1
				})
			},
			uniAppSendMessageToNative() {
				// 向宿主App发送事件
				uni.sendNativeEvent('unimp-event', {
					msg: 'unimp message!!!'
				}, ret => {
					let nativeMsg = '宿主App回传的数据：' + ret
					uni.showToast({
						title: nativeMsg,
						icon: 'none',
						position: 'top'
					})
				})
			},
			closeUniApp() {
				plus.runtime.quit()
			}
		}
	}
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
