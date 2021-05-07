<template>
	<view class="">
		<image class="logo content" src="/static/uview/common/logo.png"></image>
		<u-cell-item title="体系" index="0" @click="click"></u-cell-item>
		<u-cell-item title="积分排行榜" index="1" @click="click"></u-cell-item>
		<u-cell-item v-if="this.userInfo.hasLogin" title="我的积分历史" index="2" @click="click"></u-cell-item>
		<u-cell-item title="" :arrow="false" :border-bottom="false"></u-cell-item>
		<u-cell-item :title="this.loginStatusText()" class="content" bgColor="#ccc" index="999" @click="click" :arrow="false" :border-bottom="false"></u-cell-item>
		<u-modal v-model="show" content="是否登出？" :show-cancel-button="true" @confirm="sureLogout" ref="uModal" :async-close="true"></u-modal>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
	data() {
		return {
			show: false
		};
	},
	computed: {
		...mapState(['userInfo'])
	},
	onLoad() {
		this.autoLogin();
	},
	onShow() {},
	methods: {
		...mapMutations(['storeLogout', 'storeLogin']),
		loginStatusText() {
			if (this.userInfo.hasLogin) {
				return '退出登录';
			} else {
				return '登录';
			}
		},
		click(index) {
			switch (index) {
				case '0':
					this.$u.route('/pages/my/tree');
					break;
				case '1':
					this.$u.route('/pages/my/ranking');
					break;
				case '2':
					this.$u.route('/pages/my/history');
					break;
				case '999':
					this.loginOrlogout();
					break;
				default:
					break;
			}
		},
		loginOrlogout() {
			if (this.userInfo.hasLogin) {
				this.show = true;
			} else {
				this.$u.route('/pages/login/index');
			}
		},
		sureLogout() {
			this.$u.api.logout().then(res => {
				this.show = false;
				if (typeof res == 'string') {
					let message = res;
					this.$refs.uToast.show({
						title: message
					});
					return;
				}
				this.storeLogout();
			});
		},
		autoLogin() {
			if (this.userInfo.hasLogin) {
				return;
			}

			let mobile = uni.getStorageSync('username');
			let code = uni.getStorageSync('password');

			if (mobile.length == 0 || code.length == 0) {
				return;
			}

			console.log(mobile);
			console.log(code);
			this.$u.api.login(mobile, code).then(res => {
				if (typeof res == 'string') {
					let message = res;
					this.$refs.uToast.show({
						title: message
					});
					return;
				}

				this.$refs.uToast.show({
					title: '自动登录成功'
				});

				const temp = {
					cookie: 'loginUserName=' + mobile + ';' + 'loginUserPassword=' + code,
					profile: res
				};

				// 刷新操作
				this.storeLogin(temp);
				uni.setStorageSync('username', mobile);
				uni.setStorageSync('password', code);
			});
		},
		getUserCoinInfo() {
			this.$u.api.userCoinInfo().then(res => {
				console.log(res);
			});
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
	margin-top: 44rpx;
	margin-left: auto;
	margin-right: auto;
	margin-bottom: 50rpx;
}

.text-area {
	display: flex;
	justify-content: center;
}

.title {
	font-size: 36rpx;
	color: #8f8f94;
}
</style>
