import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
	// state - 用户信息
	const userInfo = ref({
		hasLogin: false,
		cookie: '',
		profile: {}
	})

	// actions - 用户登录
	const storeLogin = (payload) => {
		const temp = {
			hasLogin: true,
			cookie: payload.cookie,
			profile: payload.profile
		}

		userInfo.value = { ...userInfo.value, ...temp }

		// 将用户信息保存在本地
		uni.setStorageSync('userInfo', JSON.stringify(userInfo.value))
	}

	// actions - 退出登录
	const storeLogout = () => {
		const temp = {
			hasLogin: false,
			cookie: '',
			profile: {}
		}
		userInfo.value = { ...userInfo.value, ...temp }

		uni.removeStorageSync('userInfo')
	}

	// 初始化：从本地存储恢复用户信息
	const initUserInfo = () => {
		const localUserInfo = uni.getStorageSync('userInfo')
		if (localUserInfo) {
			try {
				userInfo.value = JSON.parse(localUserInfo)
			} catch (e) {
				console.error('解析本地用户信息失败', e)
			}
		}
	}

	return {
		userInfo,
		storeLogin,
		storeLogout,
		initUserInfo
	}
})
