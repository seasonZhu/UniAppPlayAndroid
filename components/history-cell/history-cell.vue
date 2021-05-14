// 通过uni-app的easycom： 将组件引入精简为一步。这是HBuilderX的IDE自己带的功能
// 只要组件安装在项目的 components 目录下，并符合 components/组件名称/组件名称.vue 目录结构。就可以不用引用、注册，直接在页面中使用。
<template>
	<view class="history-row u-border-bottom" @tap="click(item)">
		<view class="time">{{ timeFormat }}</view>
		<view class="reason">{{ item.reason }}</view>
		<space></space>
		<view class="coin">{{ item.coinCount + '分' }}</view>
	</view>
</template>

<script>
export default {
	props: {
		item: {
			type: Object,
			default() {
				return {}
			},
			required: true
		},
		hoverClass: {
			type: String,
			default: 'u-cell-hover'
		},
	},
	computed: {
		timeFormat() {
			return this.formatDate(this.item.date)
		}
	},
	methods: {
		formatDate(timeStamp) {
		  var date = new Date(timeStamp);
		  var y = date.getFullYear(),
		    m = date.getMonth() + 1,
		    d = date.getDate(),
		    h = date.getHours(),
		    i = date.getMinutes(),
		    s = date.getSeconds();
		  if (m < 10) { m = '0' + m; }
		  if (d < 10) { d = '0' + d; }
		  if (h < 10) { h = '0' + h; }
		  if (i < 10) { i = '0' + i; }
		  if (s < 10) { s = '0' + s; }
		  var t = y + '-' + m + '-' + d + ' ' + h + ':' + i + ':' + s;
		  return t;
		},
		click(item) {
			console.log(item.desc)
		}
	}
}
</script>

<style lang="scss">
.history-row {
	height: 88rpx;
	display: flex;
	flex-direction: row; // 横向布局
	align-items: center; // 交叉轴
	justify-content: flex-start; // 主轴
	.time {
		margin-left: 32rpx;
		margin-right: 32rpx;
	}
	.reason {
		margin-left: 32rpx;
		margin-right: 32rpx;
	}
	.coin {
		margin-right: 32rpx;
	}
}
</style>
