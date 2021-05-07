<template>
	<view class="padding">
		<u-field v-model="mobile" label="手机号" placeholder="请填写手机号"></u-field>
		<u-field v-model="code" label="密码" placeholder="请填写密码" :password="true"></u-field>
		<u-field v-model="reCode" label="确认密码" placeholder="请再次填写密码" :password="true"></u-field>
		<u-gap height="40"></u-gap>
		<u-button type="primary" @click="login">点击注册</u-button>
		<u-toast ref="uToast" />
	</view>
</template>

<script>
import { mapMutations } from 'vuex';
export default {
	data() {
		return {
			mobile: '',
			code: '',
			reCode: ''
		};
	},
	methods: {
		...mapMutations(['storeLogin']),
		login() {
			this.$u.route({
				type: 'navigateBack',
				url: 'pages/my/index'
			});
			return;

			if (this.mobile.trim().length == 0) {
				this.$refs.uToast.show({
					title: '手机号不能为空'
				});
				return;
			}

			if (this.code.trim().length == 0) {
				this.$refs.uToast.show({
					title: '密码不能为空'
				});
				return;
			}

			if (this.reCode.trim().length == 0) {
				this.$refs.uToast.show({
					title: '再次确认密码不能为空'
				});
				return;
			}

			if (this.reCode != this.code) {
				this.$refs.uToast.show({
					title: '两次密码输入不一致'
				});
				return;
			}

			this.$u.api.register(this.mobile, this.code, this.reCode).then(res => {
				if (typeof res == 'string') {
					let message = res;
					this.$refs.uToast.show({
						title: message
					});
					return;
				}

				this.$u.api.login(this.mobile, this.code).then(res => {
					if (typeof res == 'string') {
						let message = res;
						this.$refs.uToast.show({
							title: message
						});
						return;
					}

					this.$refs.uToast.show({
						title: '登录成功',
						callback: () =>
							uni.switchTab({
								url: '/pages/my/index'
							})
					});

					const temp = {
						cookie: 'loginUserName=' + this.mobile + ';' + 'loginUserPassword=' + this.code,
						profile: res
					};
					this.storeLogin(temp);

					this.$u.route({
						type: 'navigateBack',
						url: 'pages/components/empty/index'
					});
				});
			});
		}
	}
};
</script>

<style scoped lang="scss">
.padding {
	margin-left: 32rpx;
	margin-right: 32rpx;
}
.register {
	margin-top: 20rpx;
	margin-right: 32rpx;
}
</style>
