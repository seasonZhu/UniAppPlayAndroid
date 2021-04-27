<template>
	<view>
		<u-swiper :list="list" name="imagePath" img-mode="widthFix" :height="420" @click="click"></u-swiper>
		<view v-for="(item,index) in tops" :key="index">
			<u-cell-item :title="item.title" :label="item.author" :value="item.zan" :index="index"></u-cell-item>
		</view>
		<view v-for="(item,index) in normals" :key="index + tops.length">
			<u-cell-item :title="item.title" :label="item.author" :value="item.zan" :index="index"></u-cell-item>
		</view>
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
				curPage:0,
			}
		},
		async onLoad() {
			this.getBanner()
			this.getTopArticle()
		},
		methods: {
			getBanner() {
				this.$u.api.banner().then(res => {
					this.list = res
				})
			},
			getTopArticle() {
				this.$u.api.top().then(res => {
					console.log(res)
					this.tops = res
					this.getNormalArticle()
				})
			},
			getNormalArticle() {
				this.$u.api.normal({"page": this.page}).then(res => {
					console.log(res)
					this.normals = res.datas
					this.curPage = res.curPage
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
				console.log(url)
				this.openPage(url)
			},
		}
	}
</script>

<style>
</style>
