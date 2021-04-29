<template>
	<view>
		<u-swiper :list="list" name="imagePath" img-mode="widthFix" height="450" border-radius="0" bg-color="#ffffff" @click="click"></u-swiper>
		<view v-for="(item,index) in tops" :key="index">
			<u-cell-item :title="item.title" :label="item.author" :value="item.zan" :index="index" @click="topCellClick"></u-cell-item>
		</view>
		<view v-for="(item,index) in normals" :key="index + tops.length">
			<u-cell-item :title="item.title" :label="item.author" :value="item.zan" :index="index" @click="normalCellClick"></u-cell-item>
		</view>
		<u-loadmore :status="status" @loadmore="loadmore"/>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				list:[],
				tops:[],
				normals:[],
				page:0,
				status: 'loadmore',
			}
		},
		async onLoad() {
			this.getBanner()
			this.getTopArticle()
		},
		// 下拉刷新
		onPullDownRefresh(){
			console.log("下拉刷新")
			this.tops = [];
			this.normals = [];
			this.page = 0;
			this.getTopArticle()
		},
		// 上拉加载更多
		onReachBottom() {
			console.log("另个一个上拉加载更多")
			this.page++
			this.status = 'loading'
			this.getNormalArticle()
		},
		onNavigationBarButtonTap(e) {
			console.log(e.float)
			this.$u.route('/pages/index/search');
		},
		methods: {
			getBanner() {
				this.$u.api.banner().then(res => {
					this.list = res
				})
			},
			getTopArticle() {
				this.$u.api.top().then(res => {
					uni.stopPullDownRefresh();
					this.tops = res
					this.getNormalArticle()
				})
			},
			getNormalArticle() {
				this.$u.api.normal({"page": this.page}).then(res => {
					this.normals = this.normals.concat(res.datas)
					if (res.pageCount == res.curPage) {
						this.status = 'nomore'
					} else {
						this.status = 'loadmore'
					}
				})
			},
			openPage(url) {
				console.log("打开详细页面")
				this.$u.route('/pages/web/index', {
					"url": url
				});
			},
			click(index) {
				let url = this.list[index].url
				this.openPage(url)
			},
			topCellClick(index) {
				let url = this.tops[index].link
				this.openPage(url)
			},
			normalCellClick(index) {
				console.log(index)
				let url = this.normals[index].link
				this.openPage(url)
			},
			// 点击组件，触发加载更多事件(status为'loadmore'状态下才触发)
			loadmore() {
				// 这个感觉在App端基本上用不到
				console.log("加载更多")
			}
		}
	}
</script>

<style>
</style>
