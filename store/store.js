import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
    state: {
        userInfo: {  // 用户信息
            hasLogin: false,
            cookie: '',
            profile: {}  // 简介
        },  
    },
    mutations: {
        storeLogin(state, payload) { // 改变登录状态
            const temp = {
                hasLogin: true,
                cookie: payload.cookie,
                profile: payload.profile
            }
            
            state.userInfo = Object.assign({}, state.userInfo, temp)
            
            // 将用户信息保存在本地
            uni.setStorageSync('userInfo', JSON.stringify(state.userInfo))

        },
		
        storeLogout(state) { // 退出登录
            const temp = {
                hasLogin: false,
                cookie: '',
                profile: {}
            }
            state.userInfo = Object.assign({}, state.userInfo, temp)
            
            uni.removeStorageSync('userInfo')
        }
    }
})

export default store