<template>
	<view class="content">
		<u-cell-item title="体系" index="0" @click="click"></u-cell-item>
		<image class="logo" src="/static/uview/common/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '我的',
				tabbar: ''
			}
		},
		onLoad() {
			
		},
		methods: {
			click(index) {
				switch (index){
					case "0":
						this.$u.route('/pages/my/tree');
						break;
					default:
						break;
				}
			}
		}
	}
</script>

<style>
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		height: 200rpx;
		width: 200rpx;
		margin-top: 200rpx;
		margin-left: auto;
		margin-right: auto;
		margin-bottom: 50rpx;
	}

	.text-area {
		display: flex;
		justify-content: center;
	}

	.title {
		font-size: 36rpx;
		color: #8f8f94;
	}
</style>
