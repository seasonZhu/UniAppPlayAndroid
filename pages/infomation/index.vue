<template>
	<view class="content">
		<image class="logo" src="/static/uview/common/logo.png"></image>
		<view class="text-area">
			<text class="title">{{title}}</text>
		</view>
<!-- 		<u-tabbar :list="tabbar" :mid-button="false"></u-tabbar> -->
	</view>
</template>

<script>
	export default {
		data() {
			return {
				title: '工具',
				tabbar: ''
			}
		},
		onLoad() {
			// this.tabbar = [{
			// 		iconPath: "/static/uview/example/component.png",
			// 		selectedIconPath: "/static/uview/example/component_select.png",
			// 		text: '组件',
			// 		count: 2,
			// 		isDot: true,
			// 		pagePath: "/pages/index/index"
			// 	},
			// 	{
			// 		iconPath: "/static/uview/example/js.png",
			// 		selectedIconPath: "/static/uview/example/js_select.png",
			// 		text: '工具',
			// 		midButton: true,
			// 		pagePath: "/pages/js/index"
			// 	},
			// 	{
			// 		iconPath: "/static/uview/example/template.png",
			// 		selectedIconPath: "/static/uview/example/template_select.png",
			// 		text: '模板',
			// 		pagePath: "/pages/template/index"
			// 	},
			// ]
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
