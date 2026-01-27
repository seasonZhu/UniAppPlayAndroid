<template>
	<view class="container">
		<view class="form">
			<view class="form-item">
				<text class="label">手机号</text>
				<input class="input" v-model="mobile" placeholder="请填写手机号" type="number" />
			</view>
			<view class="form-item">
				<text class="label">密码</text>
				<input class="input" v-model="code" placeholder="请填写密码" :password="true" />
			</view>
			<view class="form-item">
				<text class="label">确认密码</text>
				<input class="input" v-model="reCode" placeholder="请再次填写密码" :password="true" />
			</view>
			<view class="gap"></view>
			<button class="btn-primary" @click="handleRegister">点击注册</button>
		</view>
	</view>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '@/stores/user.js'
import { api } from '@/config/http.js'

// Store
const userStore = useUserStore()
const { storeLogin } = userStore

// 数据
const mobile = ref('')
const code = ref('')
const reCode = ref('')

// 注册
const handleRegister = async () => {
	if (mobile.value.trim().length === 0) {
		uni.showToast({
			title: '手机号不能为空',
			icon: 'none'
		})
		return
	}

	if (code.value.trim().length === 0) {
		uni.showToast({
			title: '密码不能为空',
			icon: 'none'
		})
		return
	}

	if (reCode.value.trim().length === 0) {
		uni.showToast({
			title: '再次确认密码不能为空',
			icon: 'none'
		})
		return
	}

	if (reCode.value !== code.value) {
		uni.showToast({
			title: '两次密码输入不一致',
			icon: 'none'
		})
		return
	}

	try {
		const res = await api.register(mobile.value, code.value, reCode.value)
		if (typeof res === 'string') {
			uni.showToast({
				title: res,
				icon: 'none'
			})
			return
		}

		// 注册成功后自动登录
		const loginRes = await api.login(mobile.value, code.value)
		if (typeof loginRes === 'string') {
			uni.showToast({
				title: loginRes,
				icon: 'none'
			})
			return
		}

		uni.showToast({
			title: '注册成功',
			icon: 'success'
		})

		const temp = {
			cookie: 'loginUserName=' + mobile.value + ';' + 'loginUserPassword=' + code.value,
			profile: loginRes
		}
		storeLogin(temp)

		uni.setStorageSync('username', mobile.value)
		uni.setStorageSync('password', code.value)

		setTimeout(() => {
			uni.switchTab({
				url: '/pages/my/index'
			})
		}, 1500)
	} catch (error) {
		console.error('注册失败', error)
		uni.showToast({
			title: '注册失败',
			icon: 'none'
		})
	}
}
</script>

<script>
export default {
	options: {
		styleIsolation: 'shared'
	}
}
</script>

<style scoped>
.container {
	padding: 32rpx;
	background-color: #f5f5f5;
	min-height: 100vh;
}

.form {
	background-color: #fff;
	border-radius: 16rpx;
	padding: 40rpx 32rpx;
}

.form-item {
	display: flex;
	flex-direction: column;
	margin-bottom: 40rpx;
}

.label {
	font-size: 28rpx;
	color: #333;
	margin-bottom: 20rpx;
	font-weight: 500;
}

.input {
	height: 80rpx;
	padding: 0 20rpx;
	font-size: 28rpx;
	border: 1rpx solid #e0e0e0;
	border-radius: 8rpx;
	background-color: #f8f8f8;
}

.gap {
	height: 40rpx;
}

.btn-primary {
	height: 88rpx;
	line-height: 88rpx;
	background-color: #2979FF;
	color: #fff;
	font-size: 32rpx;
	border-radius: 12rpx;
	border: none;
	text-align: center;
}

.btn-primary::after {
	border: none;
}
</style>
