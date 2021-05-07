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
			show: false
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
		list() {
			if (this.userInfo.hasLogin) {
				return ['复制链接', '浏览器打开', '微信分享', '刷新', '收藏']
			} else {
				return ['复制链接', '浏览器打开', '微信分享', '刷新']
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
