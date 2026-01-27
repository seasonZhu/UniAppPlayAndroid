<template>
	<view class="history-row u-border-bottom" @tap="click(item)">
		<view class="time">{{ timeFormat }}</view>
		<view class="reason">{{ item.reason }}</view>
		<view class="space"></view>
		<view class="coin">{{ item.coinCount + '分' }}</view>
	</view>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'

// Props
const props = defineProps({
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
	}
})

// 当前实例（访问全局属性）
const instance = getCurrentInstance()

// 计算属性
const timeFormat = computed(() => {
	const pubFuc = instance && instance.appContext && instance.appContext.config && instance.appContext.config.globalProperties && instance.appContext.config.globalProperties.$pubFuc
	if (pubFuc && pubFuc.formatDate) {
		return pubFuc.formatDate(props.item.date)
	}
	return ''
})

// 方法
const click = (item) => {
	console.log(item.desc)
}
</script>

<script>
export default {
	options: {
		styleIsolation: 'shared'
	}
}
</script>

<style>
.history-row {
	height: 88rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
}

.history-row .time {
	margin-left: 32rpx;
	margin-right: 32rpx;
}

.history-row .reason {
	margin-left: 32rpx;
	margin-right: 32rpx;
	flex: 1;
}

.history-row .space {
	flex: 1;
}

.history-row .coin {
	margin-right: 32rpx;
}

.u-border-bottom {
	border-bottom: 1rpx solid #e5e5e5;
}
</style>
