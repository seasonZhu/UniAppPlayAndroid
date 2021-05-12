<template>
	<view>
		<web-view :src="url"></web-view>
		<u-popup v-model="show" mode="bottom">
			<view v-for="(item, index) in list" :key="index">
				<u-grid :col="1">
					<u-grid-item @click="click(item)"><view class="grid-text">{{item}}</view></u-grid-item>
				</u-grid>
			</view>
		</u-popup>
	</view>
</template>

<script>
import { mapState } from 'vuex';
export default {
	data() {
		return {
			params: {},
			show: false,
			staticList: ['复制链接', '浏览器打开', '微信分享', '刷新']
		};
	},
	onLoad(option) {
		this.params = option;
		console.log(option.id)
		console.log(option.url)
	},
	onNavigationBarButtonTap(e) {
		console.log(e.float);
		this.show = true;
	},
	computed: {
		...mapState(['userInfo']),
		url() {
			return this.params.url
		},
		collectIds() {
			return this.userInfo.profile.collectIds
		},
		id() {
			return Number(this.params.id)
		},
		hasCollected() {
			// 这个地方的判断有问题，先打的this.params.id后打的array，导致result为false
			let array = this.collectIds
			let id = this.id
			console.log(array)
			console.log(id)
			let result = array.includes(this.id)
			console.log(result)
			return result
		},
		list() {
			if (this.userInfo.hasLogin) {
				let text = this.hasCollected ? '取消收藏' : '收藏';
				let array = this.staticList
				array.push(text)
				return array
			} else {
				return this.staticList
			}
		}
	},
	methods: {
		click(item) {
			this.show = false
			console.log(item)
		}
	}
};
</script>

<style>
.grid-text {
	font-size: 28rpx;
	margin-top: 4rpx;
	color: $u-type-info;
}
</style>
