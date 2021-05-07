<template>
	<view class="">
		<view
			v-for="(item, index) in list"
			:key="index"
			:data-index="index"
			class="order-item"
			@touchstart="drawStart"
			@touchmove="drawMove"
			@touchend="drawEnd"
			:style="'right:' + item.right + 'px'"
		>
			<u-cell-item :title="item.title" :index="index" @click="click"></u-cell-item>
			<view class="remove" @click="delData(item)">取消收藏</view>
<!-- 			<view class="edit" @click="editData(item)">编 辑</view> -->
		</view>
		<u-loadmore :status="status" @loadmore="loadmore" />
	</view>
</template>

<script>
export default {
	data() {
		return {
			list: [],
			page: 0,
			status: 'loadmore'
		};
	},
	onLoad() {
		this.getCollectArticleList();
	},
	// 上拉加载更多
	onReachBottom() {
		console.log('另个一个上拉加载更多');
		this.page++;
		this.status = 'loading';
		this.getCollectArticleList();
	},
	methods: {
		getCollectArticleList() {
			this.$u.api.collectArticleList(this.page).then(res => {
				console.log(res);
				uni.stopPullDownRefresh();
				this.list = this.list.concat(res.datas);
				if (res.pageCount == res.curPage) {
					this.status = 'nomore';
				} else {
					this.status = 'loadmore';
				}
			});
		},
		openPage(url, id) {
			this.$u.route('/pages/web/index', {
				url: url,
				id: id
			});
		},
		click(index) {
			let url = this.list[index].link
			let id = this.list[index].id
			this.openPage(url,id);
		},
		drawStart(e) {
			console.log('开始触发');
			var touch = e.touches[0];
			this.startX = touch.clientX;
		},
		//触摸滑动
		drawMove(e) {
			console.log('滑动');
			for (var index in this.list) {
				this.$set(this.list[index], 'right', 0);
			}
			var touch = e.touches[0];
			var item = this.list[e.currentTarget.dataset.index];
			var disX = this.startX - touch.clientX;
			if (disX >= 20) {
				if (disX > this.delBtnWidth) {
					disX = this.delBtnWidth;
				}
				this.$set(this.list[e.currentTarget.dataset.index], 'right', disX);
			} else {
				this.$set(this.list[e.currentTarget.dataset.index], 'right', 0);
			}
		},
		//触摸滑动结束
		drawEnd(e) {
			console.log('滑动结束');
			var item = this.list[e.currentTarget.dataset.index];
			if (item.right >= this.delBtnWidth / 2) {
				this.$set(this.list[e.currentTarget.dataset.index], 'right', this.delBtnWidth);
			} else {
				this.$set(this.list[e.currentTarget.dataset.index], 'right', 0);
			}
		},
		//删除方法
		delData(item) {
			console.log('删除');
			uni.showModal({
				title: '提示',
				content: '确认注销该人员？',
				success: function(res) {
					if (res.confirm) {
						console.log('用户点击确定');
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
		},
		editData(item) {
			uni.showModal({
				title: '提示',
				content: '确认编辑该项目？',
				success: function(res) {
					if (res.confirm) {
						console.log('用户点击确定');
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
		}
	}
};
</script>

<style>
.order-item {
	width: 100%;
	display: flex;
	position: relative;
	align-items: right;
	flex-direction: row;
}
.remove {
	margin-left: -5%;
	width: 80px;
	height: 100%;
	background-color: red;
	color: #ffffff;
	position: absolute;
	top: 0;
	right: -80px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 16px;
}
.edit {
	width: 80px;
	height: 100%;
	background-color: green;
	color: white;
	position: absolute;
	top: 0;
	right: -160px;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 16px;
}
</style>
