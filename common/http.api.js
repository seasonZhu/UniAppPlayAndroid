let getBanner = 'banner/json';

let topArticle = 'article/top/json'

let normalArticle = 'article/list/'

let getSearchHotKey = 'hotkey/json'

let queryKey = 'article/query/'

let getProjectClassify = 'project/tree/json';

let getProjectClassifyList = 'project/list/';

let getPubilicNumber = 'wxarticle/chapters/json';

let getPubilicNumberList = 'wxarticle/list/';

// 登录
let postLogin = 'user/login';

// 注册
let postRegister = 'user/register';

// 登录退出
let getLogout = 'user/logout/json';

// 收藏站内文章 lg/collect/1165/json
let postCollectArticle = 'lg/collect/';

// 取消收藏站内文章 lg/uncollect_originId/1165/json
let postUnCollectArticle = 'lg/uncollect_originId/';

// 收藏文章列表
let getCollectArticleList = 'lg/collect/list/';

// 积分排行榜 lg/coin/list/1/json
let getRankingList = 'coin/rank/';

// 个人积分获取列表
let getCoinList = 'lg/coin/list/';

// 个人积分
let getUserCoinInfo = 'lg/coin/userinfo/json';

// 体系
let getTree = "tree/json";

// 体系详细 article/list/0/json?cid=1 其实和getArticleList接口一样
let getTreeDetailList = "article/list/";

// 此处第二个参数vm，就是我们在页面使用的this，你可以通过vm获取vuex等操作，更多内容详见uView对拦截器的介绍部分：
// https://uviewui.com/js/http.html#%E4%BD%95%E8%B0%93%E8%AF%B7%E6%B1%82%E6%8B%A6%E6%88%AA%EF%BC%9F
const install = (Vue, vm) => {

	// 轮播图
	let banner = (params = {}) => vm.$u.get(getBanner, params);
	
	// 置顶文章
	let top = (params = {}) => vm.$u.get(topArticle, params);
	
	// 一般文章
	let normal = (params = {"page": "-1"}) => vm.$u.get(normalArticle + params.page + '/json', params);
	
	// 热词
	let hotKey = (params = {}) => vm.$u.get(getSearchHotKey, params);
	
	// 关键词搜索（目前已经改好了）
	let queryKeyword = (keyword, page) => vm.$u.post(queryKey  + page.toString() + '/json' + "?k=" + keyword);
	
	// 项目分类
	let projectTopic = (params = {}) => vm.$u.get(getProjectClassify, params);
	
	// 项目列表
	let projectList = (params = {}, page) => vm.$u.get(getProjectClassifyList+ page.toString() + "/json", params);
	
	// 公众号
	let publicNumTopic = (params = {}) => vm.$u.get(getPubilicNumber, params);
	
	// 公众号文章列表
	let publicNumList = (params = {}, page) => vm.$u.get(getPubilicNumberList+ page.toString() + "/json", params);
	
	// 将各个定义的接口名称，统一放进对象挂载到vm.$u.api(因为vm就是this，也即this.$u.api)下
	vm.$u.api = {banner, top, normal, hotKey, queryKeyword, projectTopic, projectList, publicNumTopic, publicNumList};
}

export default {
	install
}