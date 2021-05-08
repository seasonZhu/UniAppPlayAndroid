<template>
	<view class="wrap">
		<view class="u-tabs-box"><u-tabs-swiper ref="uTabs" :list="topics" @change="tabsChange" :is-scroll="true"></u-tabs-swiper></view>
		<swiper class="swiper-box" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
			<swiper-item class="swiper-item" v-for="(item, index) in topics" :key="index">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="reachBottom">
					<view class="">
						<view v-for="(model, idx) in lists[index]" :key="idx">
							<u-cell-item :title="model.title" :label="model.author" :value="model.zan" :index="idx" @click="click(index, idx)"></u-cell-item>
						</view>
						<u-loadmore :status="status" @loadmore="loadmore" />
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
export default {
	data() {
		return {
			topics: [],
			// 因为内部的滑动机制限制，请将tabs组件和swiper组件的current用不同变量赋值
			current: 0, // tabs组件的current值，表示当前活动的tab选项
			swiperCurrent: 0 ,// swiper组件的current值，表示当前那个swiper-item是活动的
			status: 'loadmore',
			lists: [[]],
			pages: [],
		};
	},
	async onLoad() {
		await this.getProjectTopic();
	},
	methods: {
		async getProjectTopic() {
			this.topics = await this.$u.api.publicNumTopic()
			console.log(this.topics)
			for (let i = 0; i < this.topics.length; i++) {
				this.pages[i] = 0
				await this.getProjectList(i)
			}
			this.tabsChange(1)
			this.tabsChange(0)
		},
		async getProjectList(index, isLoadMore = false) {
			let model = this.topics[index]
			let id = model.id
			let page 
			if (isLoadMore) {
				page = this.pages[index] + 1
				this.pages[index] = page
			}else {
				page = this.pages[index]
			}
			console.log(id)
			await this.$u.api.publicNumList(id, page).then(res => {
				console.log(res)
				let array = [].concat(res.datas)
				if (isLoadMore) {
					let lastArray = this.lists[index]
					this.lists[index] = lastArray.concat(array)
				}else {
					this.lists[index] = array
				}
			})
		},
		// tabs通知swiper切换
		tabsChange(index) {
			this.swiperCurrent = index
		},
		// swiper-item左右移动，通知tabs的滑块跟随移动
		transition(e) {
			let dx = e.detail.dx;
			this.$refs.uTabs.setDx(dx)
		},
		// 由于swiper的内部机制问题，快速切换swiper不会触发dx的连续变化，需要在结束时重置状态
		// swiper滑动结束，分别设置tabs和swiper的状态
		animationfinish(e) {
			let current = e.detail.current;
			this.$refs.uTabs.setFinishCurrent(current)
			this.swiperCurrent = current
			this.current = current
		},
		// scroll-view到底部加载更多
		reachBottom() {
			console.log('上拉加载更多')
			this.getProjectList(this.current, true)
		},
		openPage(url, id) {
			console.log("打开详细页面")
			this.$u.route('/pages/web/index', {
				"url": url,
				"id": id
			});
		},
		click(index, idx) {
			let url = this.lists[index][idx].link
			let id = this.lists[index][idx].id
			this.openPage(url, id)
		},
	}
};
</script>

<style>
.wrap {
	display: flex;
	flex-direction: column;
	height: calc(100vh - var(--window-top));
	width: 100%;
}
.swiper-box {
	flex: 1;
}
.swiper-item {
	height: 100%;
}
</style>
