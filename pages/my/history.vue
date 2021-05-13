<template>
	<view class="">
		<view v-for="(item, index) in list" :key="index">
<!-- 			<u-cell-item :title="item.desc" :index="index" :arrow="false"></u-cell-item> -->
			<history-cell :item="item"></history-cell>
		</view>
		<u-loadmore :status="status" @loadmore="loadmore" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			page: 1,
			status: 'loadmore'
		};
	},
	onLoad() {
		this.getMyCoinList();
	},
	// 上拉加载更多
	onReachBottom() {
		console.log('另个一个上拉加载更多');
		this.page++;
		this.status = 'loading';
		this.getMyCoinList();
	},
	methods: {
		getMyCoinList() {
			this.$u.api.myCoinList(this.page).then(res => {
				console.log(res);
				uni.stopPullDownRefresh();
				this.list = this.list.concat(res.datas);
				if (res.pageCount == res.curPage) {
					this.status = 'nomore';
				} else {
					this.status = 'loadmore';
				}
			});
		}
	}
};
</script>

<style></style>
