// 这里的vm，就是我们在vue文件里面的this，所以我们能在这里获取vuex的变量，比如存放在里面的token
// 同时，我们也可以在此使用getApp().globalData，如果你把token放在getApp().globalData的话，也是可以使用的
const install = (Vue, vm) => {
	Vue.prototype.$u.http.setConfig({
		baseUrl: 'https://www.wanandroid.com/',
		
		// 如果将此值设置为true，拦截回调中将会返回服务端返回的所有数据response，而不是response.data
		// 设置为true后，就需要在this.$u.http.interceptor.response进行多一次的判断，请打印查看具体值
		// originalData: true, 
		
		// 设置自定义头部content-type,这个请求头仅仅在内置浏览器中才有效,所以这个方法并不是通用的方案
		header: {
			// 'cookie': vm.$store.state.userInfo.cookie
		}
	});
	// 请求拦截，配置Token等参数
	Vue.prototype.$u.http.interceptor.request = (config) => {
		// config.header.Token = 'xxxxxx';
		
		// 通过在请求拦截器，进行请求头的设置，可以在各个平台兼容
		config.header.cookie = vm.$store.state.userInfo.cookie
		
		// config.header.Origin = "https://juejin.cn/"
		
		//Origin: http://api.bob.com
		
		// 方式一，存放在vuex的token，假设使用了uView封装的vuex方式，见：https://uviewui.com/components/globalVariable.html
		// config.header.token = vm.token;
		
		// 方式二，如果没有使用uView封装的vuex方法，那么需要使用$store.state获取
		// config.header.token = vm.$store.state.token;
		
		// 方式三，如果token放在了globalData，通过getApp().globalData获取
		// config.header.token = getApp().globalData.username;
		
		// 方式四，如果token放在了Storage本地存储中，拦截是每次请求都执行的，所以哪怕您重新登录修改了Storage，下一次的请求将会是最新值
		// const token = uni.getStorageSync('token');
		// config.header.token = token;
		
		return config; 
	}
	// 响应拦截，判断状态码是否通过
	Vue.prototype.$u.http.interceptor.response = (res) => {
		console.log(res)
		/*
		简单来说： == 代表相同， ===代表严格相同, 为啥这么说呢， 
		
		这么理解： 当进行双等号比较时候： 先检查两个操作数数据类型，如果相同， 则进行===比较， 如果不同， 则愿意为你进行一次类型转换， 转换成相同类型后再进行比较， 
		而===比较时， 如果类型不同，直接就是false.
		*/
		if(res.errorCode == 0) {
			// 如果把originalData设置为了true，这里return回什么，this.$u.post的then回调中就会得到什么
			return res.data;  
		} else {
			return res.errorMsg;
		}
	}
}

export default {
	install
}