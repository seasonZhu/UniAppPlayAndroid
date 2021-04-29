<template>
	<view class="">
		<view v-for="(item,index) in list" :key="index">
			<u-cell-item :title="removeHtmlTag(item.title)" :label="item.author" :value="item.zan" :index="index" @click="click"></u-cell-item>
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
			console.log(option.keyword)
			this.option = option
			uni.setNavigationBarTitle({
			　　title:option.keyword
			})
			
			this.searchResult(option)
		},
		// 上拉加载更多
		onReachBottom() {
			console.log("另个一个上拉加载更多")
			this.page++
			this.status = 'loading'
			this.searchResult(this.option)
		},
		methods: {
			// 该接口异常，在postman中使用form-data可以调通
			searchResult(option) {
				this.$u.api.queryKeyword(option.keyword, this.page).then(res => {
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
			// 去HTML标签
			removeHtmlTag(title) {
				var msg = title.replace(/<\/?[^>]*>/g, '') //去除HTML Tag
				msg = msg.replace(/[|]*\n/, '')//去除行尾空格
				msg = msg.replace(/&nbsp;/gi, '')
				return msg
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
