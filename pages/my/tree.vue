<template>
	<view class="">
		<view v-for="(item, index) in list" :key="index">
			<u-cell-group :title="item.name" :border="false">
				<view class="flex-wrap">
					<view class="wrap" v-for="(child, idx) in item.children" :key="idx"><u-tag :text="child.name" :index="idx" @click="tagClick(index, idx)" /></view>
				</view>
				<u-divider half-width="100%"></u-divider>
			</u-cell-group>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: []
		};
	},
	onLoad() {
		this.getTree();
	},
	methods: {
		getTree() {
			this.$u.api.tree().then(res => {
				this.list = res;
			});
		},
		click(index) {},
		tagClick(index, idx) {
			console.log(index);
			console.log(idx);
			let model = this.list[index].children[idx];
			console.log(model.name);
			this.openPage(model);
		},
		openPage(model) {
			console.log('单个体系的详细页面');
			this.$u.route('/pages/my/detail', { id: model.id, name: model.name, order: model.order, parentChapterId: model.parentChapterId });
		}
	}
};
</script>

<style>
.flex-wrap {
	display: flex;
	display: -webkit-flex;
	flex-wrap: wrap;
	width: auto;
	height: auto;
	margin: 16rpx;
}
.wrap {
	margin: 10rpx;
}
</style>
