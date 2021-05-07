<template>
	<view>
		<u-swiper :list="list" name="imagePath" img-mode="widthFix" height="450" border-radius="0" @click="click"></u-swiper>
		<view v-for="(item, index) in tops" :key="index">
			<u-cell-item :title="item.title" :label="item.author" :value="item.zan" :index="index" @click="topCellClick">
<!-- 				<view class="image" v-if="item.envelopePic != null">
					<image :src="item.envelopePic" slot="icon" size="32" mode="widthFix"></image>
				</view>
				<u-icon slot="icon" size="32" name="search"></u-icon> -->
<!-- 			如何理解slot,它就是一个()->Widget的闭包,用于自定义某个控件,使得其自定义化更高 -->
			</u-cell-item>
		</view>
		<view v-for="(item, index) in normals" :key="index + tops.length">
			<u-cell-item :title="item.title" :label="item.author" :value="item.zan" :index="index" @click="normalCellClick"></u-cell-item>
		</view>
		<u-loadmore :status="status" @loadmore="loadmore" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			tops: [],
			normals: [],
			page: 0,
			status: 'loadmore'
		}
	},
	async onLoad() {
		this.getBanner()
		this.getTopArticle()
	},
	// 下拉刷新
	onPullDownRefresh() {
		console.log('下拉刷新')
		this.tops = []
		this.normals = []
		this.page = 0
		this.getTopArticle()
	},
	// 上拉加载更多
	onReachBottom() {
		console.log('另个一个上拉加载更多')
		this.page++
		this.status = 'loading'
		this.getNormalArticle()
	},
	onNavigationBarButtonTap(e) {
		console.log(e.float)
		this.$u.route('/pages/index/search')
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
				this.tops = res;
				this.getNormalArticle();
			})
		},
		getNormalArticle() {
			this.$u.api.normal({ page: this.page }).then(res => {
				this.normals = this.normals.concat(res.datas)
				if (res.pageCount == res.curPage) {
					this.status = 'nomore'
				} else {
					this.status = 'loadmore'
				}
			})
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
		},
		topCellClick(index) {
			let url = this.tops[index].link
			let id = this.tops[index].id
			this.openPage(url,id)
		},
		normalCellClick(index) {
			console.log(index)
			let url = this.normals[index].link
			let id = this.normals[index].id
			this.openPage(url,id)
		},
		// 点击组件，触发加载更多事件(status为'loadmore'状态下才触发)
		loadmore() {
			// 这个感觉在App端基本上用不到
			console.log('加载更多')
		}
	}
};
</script>

<style>
.image {
	width: 32rpx;
	height: 32rpx;
}
</style>
