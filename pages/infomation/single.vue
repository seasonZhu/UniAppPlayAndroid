<template>
	<view >
		<scroll-view scroll-y style="height: 100%;width: 100%;" @scrolltolower="onreachBottom">
			<view v-for="(model,index) in getProjectList(this.id)" :key="index">
				<u-cell-item :title="model.title" :label="model.author" :index="index" @click="click"></u-cell-item>
			</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				page: 0,
				list: [],
			};
		},
		props: {
			item: {
				type: Object,
				default() {
					return {}
				}
			},
		},
		computed: {
			id() {
				return this.item.id
			}
		},
		onLoad() {
			// this.getProjectList(this.id);
		},
		methods: {
			async getProjectList() {
				let array = await this.$u.api.projectList({"cid": this.item.id.toString(),}, 0)
				console.log(array)
				this.list = this.list.concat(array)
				return this.list
			},
			// scroll-view到底部加载更多
			onreachBottom() {
				
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
		},
	}
</script>

<style>
</style>
