<template>
	<view class="">
		<view v-for="(item, index) in list" :key="index">
			<uni-swipe-action>
				<uni-swipe-action-item :right-options="options" @click="onClick(index)" @change="swipeChange">
					<u-cell-item :title="item.title" :index="index" @click="cellClick"></u-cell-item>
				</uni-swipe-action-item>
			</uni-swipe-action>
		</view>
		<u-loadmore :status="status" @loadmore="loadmore" />
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
	data() {
		return {
			list: [],
			page: 0,
			status: 'loadmore',
			options: [
				{
					text: '取消收藏',
					style: {
						backgroundColor: '#dd524d'
					}
				},
			]
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
	computed: {
		...mapState(['userInfo'])
	},
	watch: {
		'userInfo.profile.collectIds'() {
			this.getCollectArticleList(true);
		}
	},
	methods: {
		...mapMutations(['storeLogin']),
		getCollectArticleList(fromWatch = false) {
			this.$u.api.collectArticleList(this.page).then(res => {
				console.log(res);
				uni.stopPullDownRefresh();
				if (fromWatch) {
					this.list = res.datas;
				} else {
					this.list = this.list.concat(res.datas);
				}
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
		cellClick(index) {
			return
			let url = this.list[index].link;
			let id = this.list[index].originId;
			this.openPage(url, id);
		},
		swipeChange(e, index) {
			// console.log('当前状态：' + index)
		},
		// 原始的点击侧滑按钮的事件
		exampleClick(index) {
			console.log('点击了' + (e.position === 'left' ? '左侧' : '右侧') + e.content.text + '按钮')
			console.log(e)
		},
		unCollected(id) {
			this.$u.api.actionUnCollected(id)
			.then(res => {
				console.log(res)
				if (res == undefined) {
					this.autoLogin()
				}
			})
		},
		autoLogin() {
			if (!this.userInfo.hasLogin) {
				return;
			}
					
			let mobile = uni.getStorageSync('username')
			let code = uni.getStorageSync('password')
					
			if (mobile.length == 0 || code.length == 0) {
				return
			}
					
			this.$u.api.login(mobile, code).then(res => {
				if (typeof res == 'string') {
					let message = res
					this.$refs.uToast.show({
						title: message
					});
					return
				}
										
				const temp = {
					cookie: 'loginUserName=' + mobile + ';' + 'loginUserPassword=' + code,
					profile: res
				}
					
				// 刷新操作
				this.storeLogin(temp);
				uni.setStorageSync('username', mobile)
				uni.setStorageSync('password', code)
				
				this.getCollectArticleList(true)
			});
		},
		onClick(index) {
			console.log(index)
			let id = this.list[index].originId
			console.log(id)
			this.unCollected(id)
			// uni.showModal({
			//     title: '提示',
			//     content: '是否取消收藏',
			//     success(res) {
			//         if (res.confirm) {
			// 			// 我不是很明白，为啥在这里就找不到这个函数了呢
			// 			let id = this.list[index].originId
			// 			this.unCollected(id)
			//         } else if (res.cancel) {
			//             console.log('用户点击取消');
			//         }
			//     }
			// });
		},
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

/* 这段代码在App端、微信小程序端会有问题，所以不写了
<view
	v-for="(item, index) in list"
	:key="index"
	:data-index="index"
	class="order-item"
	@touchstart="drawStart"
	@touchmove="drawMove"
	@touchend="drawEnd"
	:style="'right:' + item.right + 'rpx'"
>
			<!-- > 这里在微信小程序箭头显示会有点问题 -->
			<u-cell-item :title="item.title" :index="index" @click="click"></u-cell-item>
			<view class="remove" @click="delData(item)">取消收藏</view>
			<view class="edit" @click="editData(item)">编 辑</view>
		</view>
*/
