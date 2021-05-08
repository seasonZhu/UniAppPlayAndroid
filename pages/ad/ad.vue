<template>
	<view class="ad-page">
		<view class="logo-bg">
			<image class="top-logo" src="/static/ad/1.png"></image>
			<image class="bot-logo" src="/static/ad/2.png"></image>
		</view>
		<view class="ad-bg" :class="{active: isShowAd}">
			<image class="ad" :src="picture" mode="aspectFit"></image>
			<view class="ad-logo">
				<image class="img" src="/static/ad/3.png"></image>
			</view>
			<view class="close" @click="close">跳过</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				isShowAd: false,
				picture: '',
				startTime: 0,
				adWaitTime: 2000,
				adShowTime: 8000,
				adTimer: null,
				closeTime: 5
			};
		},
		onShow () {
			//this.getAd()
			this.mockAd()
			this.startTime = (new Date()).getTime()
		},
		methods:{
			/// 这个接口在本地服务没有，所以必须走下面的mockAd接口进行调试
			getAd () {
				// 初始化 isShowAd，防止缓存
				this.isShowAd = false
				// apiAd().then(res => {
				// 	console.log(res)
				// 	let date = new Date()
				// 	let nowTime = date.getTime()
					
				// 	// 请求时间超过logo关闭（adWaitTime）的时间情况下直接显示广告
				// 	// 如果请求时间未超过logo关闭（adWaitTime）的时间情况下，等待logo关闭时间再显示广告
				// 	let questTime = nowTime - this.startTime
				// 	let wait = questTime < this.adWaitTime ? (this.adWaitTime - questTime) : 0
					
				// 	setTimeout(() => {
				// 		this.isShowAd = true
				// 		this.picture = res.mock.ad
				// 	}, wait)
				// })
				
				// 整个开屏广告不大于8秒
				this.adTimer = setTimeout(() => {
					this.close()
				}, this.adShowTime)
			},
			// 关闭广告页
			close() {
				// 清除计时器
				clearTimeout(this.adTimer)
				// 进入到首页
				uni.switchTab({
				    url: '/pages/index/index'
				})
			},
			// mock的广告页面
			mockAd () {
				// 初始化 isShowAd，防止缓存
				this.isShowAd = false
				// 
				let date = new Date()
				let nowTime = date.getTime()
				
				// 请求时间超过logo关闭（adWaitTime）的时间情况下直接显示广告
				// 如果请求时间未超过logo关闭（adWaitTime）的时间情况下，等待logo关闭时间再显示广告
				let questTime = nowTime - this.startTime
				let wait = questTime < this.adWaitTime ? (this.adWaitTime - questTime) : 0
				
				setTimeout(() => {
					this.isShowAd = true
					this.picture = "https://ss1.bdstatic.com/70cFvXSh_Q1YnxGkpoWK1HF6hhy/it/u=2367523648,2986421689&fm=26&gp=0.jpg"
				}, wait)
				
				// 整个开屏广告不大于8秒
				this.adTimer = setTimeout(() => {
					this.close()
				}, this.adShowTime)
			},
		}
	}
</script>

<style lang="scss">
.ad-page{
	position:fixed;
	top:0;
	right:0;
	bottom:0;
	left:0;
	background: #da2d1f;
	z-index: 1000;
	.top-logo{
		position:absolute;
		top: 423rpx;
		left:50%;
		width:450rpx;
		height:93rpx;
		transform: translateX(-50%);
	}
	.bot-logo{
		position:absolute;
		bottom: 40rpx;
		left:50%;
		width:220rpx;
		height:43rpx;
		transform: translateX(-50%);
	}
	.ad{
		position:absolute;
		width:100%;
		height:100%;
		z-index: 2;
		background: #fff;
	}
	.logo-bg{
		opacity: 1;
		transition: opacity 0.3s;
		&.active{
			opacity: 0;
			display: none;
		}
	}
	.ad-bg{
		opacity: 0;
		transition: opacity 0.3s;
		&.active{
			opacity: 1;
			display: block;
		}
	}
	.ad-logo{
		position:absolute;
		left:0;
		bottom:0;
		width:100%;
		height: 168rpx;
		background: #fff;
		z-index: 3;
		.img{
			display: block;
			width:258rpx;
			height:86rpx;
			margin: 40rpx auto 0;
		}
	}
}
.close {
	position: absolute;
	right: 20rpx;
	bottom: 190rpx;
	width: 146rpx;
	height: 62rpx;
	color: #fff;
	background: rgba(0, 0, 0, 0.6);
	border-radius: 62rpx;
	text-align: center;
	line-height: 62rpx;
	z-index: 101;
}
</style>
