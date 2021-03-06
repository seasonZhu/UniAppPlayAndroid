import Vue from 'vue'
import App from './App'
import store from 'store/store.js'

Vue.prototype.$store = store

Vue.config.productionTip = false

App.mpType = 'app'

// 引入全局uView
import uView from 'uview-ui';
Vue.use(uView);

//公共js
import PubFuc from'./common/public.func.js'
Vue.prototype.$pubFuc = PubFuc

const app = new Vue({
    ...App
})

// http拦截器，将此部分放在new Vue()和app.$mount()之间，才能App.vue中正常使用
import httpInterceptor from '@/common/http.interceptor.js';
Vue.use(httpInterceptor, app);

// http接口API抽离，免于写url或者一些固定的参数
import httpApi from '@/common/http.api.js';
Vue.use(httpApi, app);

app.$mount();
