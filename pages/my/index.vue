<template>
	<view class="">
		<image class="logo content" src="/static/uview/common/logo.png"></image>
		<u-cell-item title="体系" index="0" @click="click"></u-cell-item>
		<u-cell-item title="积分排行榜" index="1" @click="click"></u-cell-item>
		<u-cell-item title="" :arrow="false" :border-bottom="false"></u-cell-item>
		<u-cell-item :title=this.loginStatusText() class="content" bgColor="#ccc" index="999" @click="click" :arrow="false" :border-bottom="false"></u-cell-item>
	</view>
</template>

<script>
import { mapState, mapMutations } from 'vuex';
export default {
	data() {
		return {};
	},
	computed: {
		...mapState(['userInfo'])
	},
	onLoad() {},
	methods: {
		...mapMutations(['storeLogout']),
		loginStatusText() {
			if(this.userInfo.hasLogin) {
				return "退出登录"
			}else {
				return "登录"
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
				case '999':
					this.$u.route('/pages/login/index');
					break;
				default:
					break;
			}
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
