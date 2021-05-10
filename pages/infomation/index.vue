<template>
	<!-- 在HTML里面使用JavaScript函数不用加this -->
	<view class="wrap">
		<view class="u-tabs-box"><u-tabs-swiper ref="uTabs" :list="topics" @change="tabsChange" :is-scroll="true"></u-tabs-swiper></view>
		<swiper class="swiper-box" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
			<swiper-item class="swiper-item" v-for="(item, index) in topics" :key="index">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="reachBottom">
					<view class="">
						<view v-for="(model, idx) in lists[index]" :key="idx">
							<u-cell-item :title="model.title" :label="model.author" :value="model.zan" :index="idx" @click="click(index, idx)">
								<image class="imageContainer" slot="icon" :src='getImage(model)' mode="aspectFit"></image>
							</u-cell-item>
						</view>
						<u-loadmore :status="listStatus[index]" @loadmore="loadmore" />
					</view>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
import single from './single.vue';
export default {
	components: {
		single: single
	},
	data() {
		return {
			topics: [],
			// 因为内部的滑动机制限制，请将tabs组件和swiper组件的current用不同变量赋值
			// tabs组件的current值，表示当前活动的tab选项
			current: 0, 
			// swiper组件的current值，表示当前那个swiper-item是活动的
			swiperCurrent: 0 ,
			lists: [],
			pages: [],
			listStatus: [],
		};
	},
	async onLoad() {
		await this.getProjectTopic();
	},
	methods: {
		async getProjectTopic() {
			this.topics = await this.$u.api.projectTopic()
			// 优化考虑用高阶map函数
			for (let i = 0; i < this.topics.length; i++) {
				this.pages[i] = 0
			}
			if(this.topics.length > 0) {
				await this.getProjectList(0)
			}
		},
		async getProjectList(index, isLoadMore = false) {
			
			// 如果index所在的数组有值，并且下拉状态不是nomore，那么就进行列表请求
			let some = this.lists[index]
			let status = this.listStatus[index]
			if (some != undefined && status == "nomore" ) {
				return
			}
			
			// 获取请求id
			let model = this.topics[index]
			let id = model.id
			
			// 获取页数
			let page 
			if (isLoadMore) {
				page = this.pages[index] + 1
				this.pages[index] = page
			}else {
				page = this.pages[index]
			}
			
			// 进行请求
			let list = await this.$u.api.projectList({ cid: id.toString() }, page).then(res => {
				let array = [].concat(res.datas)
				if (isLoadMore) {
					let lastArray = this.lists[index]
					this.lists[index] = lastArray.concat(array)
				}else {
					this.lists[index] = array
				}
				
				// 虽然页面的加载数据优化好了，但是这样对于仅有一页，底部的状态文字会出现异常，我个人还是偏向于抽出这部分逻辑成为一个单页面，目前还是尝试
				if (res.pageCount == res.curPage + 1) {
					this.listStatus.splice(index, 1, "nomore")
				} else {
					this.listStatus.splice(index, 1,"loadmore")
				}
				
				if (res.datas.length == 0) {
					this.listStatus.splice(index, 1, "nomore")
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
			this.getProjectList(current)
		},
		// scroll-view到底部加载更多
		reachBottom() {
			if (this.listStatus[this.current] == "nomore") {
				return
			}
			
			this.listStatus.splice(this.current,1,"loading")
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
		getImage(model) {
			if (model.envelopePic == "") {
				return '/static/user/placeholder.png'
			}else {
				return model.envelopePic
			}
		}
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
.imageContainer {
	width: 44rpx;
	height: 88rpx;
	margin-right: 20rpx;
	will-change: transform;
}
</style>
