<template>
	<view>
		<view>
			<u-tabs-swiper ref="uTabs" :list="topics" @change="tabsChange" :is-scroll="true" swiperWidth="750"></u-tabs-swiper>
		</view>
		<swiper class="swiper-box" :current="swiperCurrent" @transition="transition" @animationfinish="animationfinish">
			<swiper-item class="swiper-item" v-for="(item, index) in topics" :key="index">
				<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="onreachBottom">
					<view v-for="(model,idx) in list" :key="idx">
						<u-cell-item :title="model.title" :label="model.author" :index="index" @click=""></u-cell-item>
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
			swiperCurrent: 0, // swiper组件的current值，表示当前那个swiper-item是活动的
			page: 0,
			list: [],
		};
	},
	onLoad() {
		this.getProjectTopic();
	},
	methods: {
		getProjectTopic() {
			this.$u.api.projectTopic().then(res => {
				console.log(res);
				this.topics = res;
				if (this.topics.length >= 1) {
					let first = this.topics[0]
					let id = first.id
					this.getProjectList(id)
				}
			});
		},
		getProjectList(id) {
			this.$u.api.projectList({"cid": id.toString(),}, 0).then(res => {
				this.list = this.list.concat(res.datas)
				console.log(res.datas)
			})
		},
		// tabs通知swiper切换
		tabsChange(index) {
			this.swiperCurrent = index;
			this.changePage(index)
		},
		// swiper-item左右移动，通知tabs的滑块跟随移动
		transition(e) {
			let dx = e.detail.dx;
			this.$refs.uTabs.setDx(dx);
		},
		// 由于swiper的内部机制问题，快速切换swiper不会触发dx的连续变化，需要在结束时重置状态
		// swiper滑动结束，分别设置tabs和swiper的状态
		animationfinish(e) {
			let current = e.detail.current;
			this.$refs.uTabs.setFinishCurrent(current);
			this.swiperCurrent = current;
			this.current = current;
		},
		// scroll-view到底部加载更多
		onreachBottom() {
			
		},
		changePage(index) {
			this.page = 0
			this.list = []
			let id = this.topics[index].id
			this.getProjectList(id)
		}
	}
};
</script>

<style>
.swiper-item {
	height: 100%;
}
	
.swiper-box {
	flex: 1;
}	
	
</style>
