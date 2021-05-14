<template>
	<view class="">
		<view class="flex-wrap">
			<view class="wrap" v-for="(item, index) in list" :key="index">
				<u-tag :text="item.name" :index="item.name" @click="click" />
			</view>
		</view>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			searchWord: '',
			list: []
		}
	},
	onLoad() {
		this.getHotKey()
	},
	onNavigationBarSearchInputChanged: function(e) {
		console.log(e)
		this.searchWord = e.text
	},
	onNavigationBarSearchInputConfirmed: function(e) {
		console.log(e.text)
		this.openPage(e.text)
		if (e.text.length == 0) {
			this.showToast()
			return
		}
		this.openPage(this.searchWord)
	},
	onNavigationBarButtonTap(e) {
		console.log(e.float)
		console.log(this.searchWord)
		if (this.searchWord.length == 0) {
			this.showToast();
			return
		}
		this.openPage(this.searchWord)
	},
	methods: {
		getHotKey() {
			this.$u.api.hotKey().then(res => {
				this.list = res
				console.log(res)
			})
		},
		click(keyword) {
			this.openPage(keyword)
		},
		openPage(keyword) {
			this.$u.route('/pages/index/result', {
				keyword: keyword
			})
		},
		showToast() {
			this.$refs.uToast.show({
				title: '请输入关键词'
			})
		}
	}
};
</script>

<style scoped lang="scss">
.flex-wrap {
	display: flex;
	display: -webkit-flex;
	flex-wrap: wrap;
	width: auto;
	height: auto;
	margin: 16rpx;
}
.wrap {
	margin: 10rpx;
}
</style>
