<template>
	<view>
		<image class="logo content" :src="this.userHeadImageName" @tap="selectImage" ></image>
		<u-cell-item v-if="this.userInfo.hasLogin" class="content" :title="this.coinText" :arrow="false" :border-bottom="false"></u-cell-item>
		<u-cell-item title="体系" index="0" @click="click"></u-cell-item>
		<u-cell-item title="积分排行榜" index="1" @click="click"></u-cell-item>
		<u-cell-item v-if="this.userInfo.hasLogin" title="我的积分历史" index="2" @click="click"></u-cell-item>
		<u-cell-item v-if="this.userInfo.hasLogin" title="我的收藏" index="3" @click="click"></u-cell-item>
		<text class="loginOrlogoutStyle" @tap="loginOrlogout">{{this.loginStatusText}}</text>
		<u-modal v-model="show" content="是否登出？" :show-cancel-button="true" @confirm="sureLogout" ref="uModal" :async-close="true"></u-modal>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
	data() {
		return {
			show: false,
			coinInfo: {
				coinCount: '--',
				level: '--',
				rank: '--',
			},
		};
	},
	computed: {
		...mapState(['userInfo']),
		coinText() {
			return '排名:  ' + this.coinInfo.rank + '  等级:  ' + this.coinInfo.level + '  积分:  ' + this.coinInfo.coinCount
		},
		userHeadImageName() {
			if (this.userInfo.hasLogin) {
				return '/static/user/saber.jpg'
			} else {
				return '/static/uview/common/logo.png'
			}
		},
		loginStatusText() {
			if (this.userInfo.hasLogin) {
				return '退出登录'
			} else {
				return '登录'
			}
		},
	},
	watch: {
		// 通过KVC监听this.userInfo.hasLogin 哈哈
		'userInfo.hasLogin'(newValue, oldValue) {
			console.log("监听器起作用了")
			if (newValue == true) {
				this.getUserCoinInfo()
			}
		}
	},
	onLoad() {
		this.getUserCoinInfo()
	},
	methods: {
		...mapMutations(['storeLogout']),
		onPullDownRefresh() {
			this.getUserCoinInfo()
		},
		click(index) {
			switch (index) {
				case '0':
					this.$u.route('/pages/my/tree')
					break;
				case '1':
					this.$u.route('/pages/my/ranking')
					break;
				case '2':
					this.$u.route('/pages/my/history')
					break;
				case '3':
					this.$u.route('/pages/my/collection')
					break;
				case '999':
					this.loginOrlogout()
					break;
				default:
					break;
			}
		},
		loginOrlogout() {
			if (this.userInfo.hasLogin) {
				this.show = true
			} else {
				this.$u.route('/pages/login/index')
			}
		},
		sureLogout() {
			this.$u.api.logout().then(res => {
				this.show = false;
				if (typeof res == 'string') {
					let message = res
					this.$refs.uToast.show({
						title: message
					});
					return
				}
				this.storeLogout()
			});
		},
		getUserCoinInfo() {
			if (this.userInfo.hasLogin) {
				this.$u.api.userCoinInfo().then(res => {
					uni.stopPullDownRefresh();
					this.coinInfo = res
				})
			}else {
				uni.stopPullDownRefresh();
			}
		},
		selectImage() {
			console.log("点击了图片")
		}
	}
};
</script>

<style>
.content {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.logo {
	height: 200rpx;
	width: 200rpx;
	margin-top: 50rpx;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 50rpx;
	border-radius: 100rpx;
}

.text-area {
	display: flex;
	justify-content: center;
}

.title {
	font-size: 36rpx;
	color: #8f8f94;
}

.loginOrlogoutStyle {
	margin-top: 100rpx;
	height: 88rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	background-color: #2979FF;
	color: #FFFFFF;
}
</style>
