import { httpConfig, apiPaths } from './http.config'
import { useUserStore } from '@/stores/user.js'

/**
 * 请求管理器 - 统一管理loading状态
 */
const RequestManager = {
	loadingCount: 0, // 当前loading数量
	isShowing: false, // 是否正在显示loading

	/**
	 * 显示loading
	 * @param {String} text - loading文本
	 */
	show(text = '加载中...') {
		this.loadingCount++
		if (!this.isShowing) {
			this.isShowing = true
			uni.showLoading({
				title: text,
				mask: true
			})
		}
	},

	/**
	 * 隐藏loading
	 */
	hide() {
		this.loadingCount--
		if (this.loadingCount <= 0) {
			this.loadingCount = 0
			if (this.isShowing) {
				this.isShowing = false
				uni.hideLoading()
			}
		}
	},

	/**
	 * 强制隐藏loading（用于错误处理）
	 */
	forceHide() {
		this.loadingCount = 0
		if (this.isShowing) {
			this.isShowing = false
			uni.hideLoading()
		}
	}
}

/**
 * 封装 uni.request 为 Promise
 * @param {Object} options - 请求配置
 * @param {Boolean} options.showLoading - 是否显示loading，默认true
 * @param {String} options.loadingText - loading文本
 */
function request(options) {
	return new Promise((resolve, reject) => {
		// 控制是否显示loading，默认显示
		const showLoading = options.showLoading !== false
		const loadingText = options.loadingText || '加载中...'

		// 请求开始前显示loading
		if (showLoading) {
			RequestManager.show(loadingText)
		}

		// 获取用户 cookie
		const userStore = useUserStore()
		const cookie = userStore.userInfo.cookie || ''

		// 合并请求头
		const header = {
			...httpConfig.header,
			cookie,
			...options.header
		}

		// 请求完成的处理函数
		const finish = () => {
			if (showLoading) {
				RequestManager.hide()
			}
		}

		uni.request({
			url: httpConfig.baseUrl + options.url,
			method: options.method || 'GET',
			data: options.data || {},
			header: header,
			timeout: options.timeout || 60000,
			success: (res) => {
				finish()
				if (res.statusCode === 200) {
					resolve(res.data)
				} else {
					reject(res)
				}
			},
			fail: (err) => {
				finish()
				// 网络错误或超时
				if (err.errMsg) {
					console.error('请求失败:', err.errMsg)
				}
				reject(err)
			}
		})
	})
}

/**
 * GET 请求
 * @param {String} url - 请求路径
 * @param {Object} data - 请求参数
 * @param {Object} options - 额外选项
 */
function get(url, data = {}, options = {}) {
	return request({
		url,
		method: 'GET',
		data,
		...options
	})
}

/**
 * POST 请求
 * @param {String} url - 请求路径
 * @param {Object} data - 请求参数
 * @param {Object} options - 额外选项
 */
function post(url, data = {}, options = {}) {
	return request({
		url,
		method: 'POST',
		data,
		...options
	})
}

/**
 * API 方法集合
 *
 * Loading 控制规则：
 * 1. 初始加载：显示loading（默认）
 * 2. 下拉刷新：显示loading
 * 3. 上拉加载：不显示loading（设置 showLoading: false）
 * 4. 后台操作：不显示loading
 *
 * 使用示例：
 * api.list() - 显示loading
 * api.list({ showLoading: false }) - 不显示loading
 * api.list({ showLoading: true, loadingText: '加载中...' }) - 自定义loading文本
 */
export const api = {
	// 轮播图 - 初始加载
	banner: () => get(apiPaths.banner),

	// 置顶文章 - 初始加载
	top: () => get(apiPaths.topArticle),

	// 一般文章
	normal: (page = 0) => get(apiPaths.normalArticle + page + '/json', {}, {
		// 第一页显示loading，后续页面不显示（上拉加载）
		showLoading: page === 0
	}),

	// 热词 - 初始加载
	hotKey: () => get(apiPaths.searchHotKey),

	// 关键词搜索 - 用户主动操作，不显示loading
	queryKeyword: (keyword, page) => post(apiPaths.queryKey + page + '/json?k=' + keyword, {}, {
		showLoading: false
	}),

	// 项目分类 - 初始加载
	projectTopic: () => get(apiPaths.projectClassify),

	// 项目列表
	projectList: (params, page = 0) => {
		const cid = params && params.cid ? params.cid : '294'
		return get(apiPaths.projectClassifyList + page + '/json?cid=' + cid, {}, {
			// 第一页显示loading，后续页面不显示
			showLoading: page === 0
		})
	},

	// 公众号分类 - 初始加载
	publicNumTopic: () => get(apiPaths.publicNumber),

	// 公众号文章列表
	publicNumList: (id, page) => get(apiPaths.publicNumberList + id + '/' + page + '/json', {}, {
		// 第一页显示loading，后续页面不显示
		showLoading: page === 0
	}),

	// 体系 - 初始加载
	tree: () => get(apiPaths.tree),

	// 体系详细
	treeDetail: (id, page) => get(apiPaths.treeDetailList + page + '/json?cid=' + id, {}, {
		// 第一页显示loading，后续页面不显示
		showLoading: page === 0
	}),

	// 总积分排名
	totalRankingList: (page) => get(apiPaths.rankingList + page + '/json', {}, {
		// 第一页显示loading，后续页面不显示
		showLoading: page === 1
	}),

	// 登录 - 用户主动操作，显示loading
	login: (username, password) => post(apiPaths.login + '?username=' + username + '&password=' + password, {}, {
		showLoading: true,
		loadingText: '登录中...'
	}),

	// 注册 - 用户主动操作，显示loading
	register: (username, password, repassword) => post(apiPaths.register + '?username=' + username + '&password=' + password + '&repassword=' + repassword, {}, {
		showLoading: true,
		loadingText: '注册中...'
	}),

	// 登出 - 后台操作，不显示loading
	logout: () => get(apiPaths.logout, {}, {
		showLoading: false
	}),

	// 个人积分信息
	userCoinInfo: () => get(apiPaths.userCoinInfo),

	// 积分历史列表
	myCoinList: (page) => get(apiPaths.coinList + page + '/json', {}, {
		// 第一页显示loading，后续页面不显示
		showLoading: page === 1
	}),

	// 个人收藏
	collectArticleList: (page) => get(apiPaths.collectArticleList + page + '/json', {}, {
		// 第一页显示loading，后续页面不显示
		showLoading: page === 0
	}),

	// 收藏操作 - 用户操作，不显示loading
	actionCollected: (id) => post(apiPaths.collectArticle + id + '/json', {}, {
		showLoading: false
	}),

	// 取消收藏操作 - 用户操作，不显示loading
	actionUnCollected: (id) => post(apiPaths.unCollectArticle + id + '/json', {}, {
		showLoading: false
	})
}

export default {
	install(app) {
		// 将 API 挂载到全局
		app.config.globalProperties.$api = api

		// 也可以将 RequestManager 挂载到全局，供页面使用
		app.config.globalProperties.$requestManager = RequestManager
	}
}
