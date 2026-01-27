<template>
	<view class="padding">
		<view class="field-item">
			<text class="field-label">手机号</text>
			<input class="field-input" v-model="mobile" placeholder="请填写手机号" type="number" />
		</view>
		<view class="field-item">
			<text class="field-label">密码</text>
			<input class="field-input" v-model="code" placeholder="请填写密码" :password="true" type="text" />
		</view>
		<view class="register">
			<space></space>
			<navigator hover-class="none" url="/pages/login/register">还没有注册？</navigator>
		</view>
		<view class="gap" style="height: 80rpx;"></view>
		<button class="login-btn" type="primary" @click="login">点击登录</button>
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

// 登录方法
const login = async () => {
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

	try {
		const res = await api.login(mobile.value, code.value)
		if (typeof res === 'string') {
			uni.showToast({
				title: res,
				icon: 'none'
			})
			return
		}

		uni.showToast({
			title: '登录成功',
			icon: 'success'
		})

		setTimeout(() => {
			uni.switchTab({
				url: '/pages/my/index'
			})
		}, 1500)

		const temp = {
			cookie: 'loginUserName=' + mobile.value + ';' + 'loginUserPassword=' + code.value,
			profile: res
		}
		storeLogin(temp)
		saveLoginInfoToLocal()
	} catch (error) {
		console.error('登录失败', error)
	}
}

const saveLoginInfoToLocal = () => {
	uni.setStorageSync('username', mobile.value)
	uni.setStorageSync('password', code.value)
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
.padding {
	margin-left: 32rpx;
	margin-right: 32rpx;
}

.field-item {
	display: flex;
	flex-direction: row;
	align-items: center;
	padding: 24rpx 0;
	border-bottom: 1rpx solid #e5e5e5;
}

.field-item .field-label {
	width: 140rpx;
	font-size: 28rpx;
	color: #333;
}

.field-item .field-input {
	flex: 1;
	font-size: 28rpx;
	height: 40rpx;
	line-height: 40rpx;
}

.register {
	margin-top: 20rpx;
	margin-right: 32rpx;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: flex-start;
}

.register navigator {
	color: #2979FF;
	font-size: 28rpx;
}

.login-btn {
	width: 100%;
	background-color: #2979FF;
	color: #FFFFFF;
	border-radius: 8rpx;
	font-size: 32rpx;
	height: 88rpx;
	line-height: 88rpx;
}
</style>
