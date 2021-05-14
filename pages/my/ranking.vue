<template>
	<view class="">
		<view v-for="(item, index) in list" :key="index">
			<u-cell-item :title="item.rank + '. ' + item.username" :value="item.level + '级  ' + item.coinCount + '分'" :index="index" :arrow="false"></u-cell-item>
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
		this.getTotalRankingList();
	},
	// 上拉加载更多
	onReachBottom() {
		console.log('另个一个上拉加载更多');
		this.page++;
		this.status = 'loading';
		this.getTotalRankingList();
	},
	methods: {
		getTotalRankingList() {
			this.$u.api.totalRankingList(this.page).then(res => {
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

<style>
	
</style>
