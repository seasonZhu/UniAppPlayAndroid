<template>
	<view class="">
		<view v-for="(item, index) in list" :key="index">
			<u-cell-item :title="formatTitle(item.title)" :label="item.author" :value="item.zan" :index="index" @click="click"></u-cell-item>
		</view>
		<u-loadmore :status="status" @loadmore="loadmore" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			page: 0,
			status: 'loadmore',
			option: {}
		}
	},
	onLoad(option) {
		console.log(option.keyword)
		this.option = option
		uni.setNavigationBarTitle({
			title: option.keyword
		})

		this.searchResult(option)
	},
	// 上拉加载更多
	onReachBottom() {
		console.log('另个一个上拉加载更多')
		this.page++
		this.status = 'loading'
		this.searchResult(this.option)
	},
	methods: {
		// 该接口异常，在postman中使用form-data可以调通
		searchResult(option) {
			this.$u.api.queryKeyword(option.keyword, this.page).then(res => {
				console.log(res)
				uni.stopPullDownRefresh()
				this.list = this.list.concat(res.datas)
				if (res.pageCount == res.curPage) {
					this.status = 'nomore'
				} else {
					this.status = 'loadmore'
				}
			});
		},
		formatTitle(title) {
			return this.$pubFuc.removeHtmlTag(title)
		},
		openPage(url, id) {
			this.$u.route('/pages/web/index', {
				url: url,
				id: id
			})
		},
		click(index) {
			let url = this.list[index].link
			let id = this.list[index].id
			this.openPage(url,id)
		}
	}
}
</script>

<style>
	
</style>
