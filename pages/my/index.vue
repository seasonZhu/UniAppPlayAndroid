<template>
	<view class="">
		<image class="logo content" src="/static/uview/common/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
		<u-cell-item title="体系" index="0" @click="click"></u-cell-item>
		<u-cell-item title="积分排行榜" index="1" @click="click"></u-cell-item>
	</view>
</template>

<script>
	export default {
		data() {
			return {

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
					case "1":
						this.$u.route('/pages/my/ranking');
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
		margin-top: 44rpx;
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
