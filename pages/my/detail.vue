<template>
	<view class="">
		<view v-for="(item,index) in list" :key="index">
			<u-cell-item :title="item.title" :label="item.author" :value="item.zan" :index="index" @click="click"></u-cell-item>
		</view>
		<u-loadmore :status="status" @loadmore="loadmore"/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[],
				page:0,
				status: 'loadmore',
				option:{},
			}
		},
		onLoad(option) {
			console.log(option.name)
			this.option = option
			uni.setNavigationBarTitle({
			　　title:option.name
			})
			
			this.treeDetai(option)
		},
		// 上拉加载更多
		onReachBottom() {
			console.log("另个一个上拉加载更多")
			this.page++
			this.status = 'loading'
			this.treeDetai(this.option)
		},
		methods: {
			treeDetai(option) {
				this.$u.api.treeDetail(option.id, this.page).then(res => {
					console.log(res)
					uni.stopPullDownRefresh();
					this.list = this.list.concat(res.datas)
					if (res.pageCount == res.curPage) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
				})
			},
			openPage(url) {
				this.$u.route('/pages/web/index', {
					"url": url
				});
			},
			click(index) {
				let url = this.list[index].link
				this.openPage(url)
			},
		}
	}
</script>

<style>
</style>
