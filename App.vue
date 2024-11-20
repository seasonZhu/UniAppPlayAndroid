<script>
	export default {
		onLaunch: function(launchInfo) {
			uni.showToast({
				title: launchInfo.referrerInfo.extraData.arguments,
				icon: 'none',
				position: 'top'
			})
			
			uni.onNativeEventReceive((event,data)=>{
				console.log('接收到宿主App消息：' + event + data)
				let nativeMsg = '接收到宿主App消息 event：' + event + " data: " + data
				uni.showToast({
					title: nativeMsg,
					icon: 'none',
					position: 'top'
				})
			})
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>


<style lang="scss">
	@import "uview-ui/index.scss";
</style>
