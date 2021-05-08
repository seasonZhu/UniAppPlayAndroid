let getBanner = 'banner/json';

let topArticle = 'article/top/json'

let normalArticle = 'article/list/'

let getSearchHotKey = 'hotkey/json'

let queryKey = 'article/query/'

let getProjectClassify = 'project/tree/json';

let getProjectClassifyList = 'project/list/';

let getPubilicNumber = 'wxarticle/chapters/json';

let getPubilicNumberList = 'wxarticle/list/';

let postLogin = 'user/login';

let postRegister = 'user/register';

let getLogout = 'user/logout/json';

// 收藏站内文章 lg/collect/1165/json
let postCollectArticle = 'lg/collect/';

// 取消收藏站内文章 lg/uncollect_originId/1165/json
let postUnCollectArticle = 'lg/uncollect_originId/';

let getCollectArticleList = 'lg/collect/list/';

let getRankingList = 'coin/rank/';

let getCoinList = 'lg/coin/list/';

let getUserCoinInfo = 'lg/coin/userinfo/json';

let getTree = "tree/json";

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
	
	// 体系
	let tree = (params = {}, page) => vm.$u.get(getTree, params);
	
	// 体系详细
	let treeDetail = (id, page) => vm.$u.get(getTreeDetailList  + page.toString() + '/json' + "?cid=" + id);
	
	// 总积分排名
	let totalRankingList = (page) => vm.$u.get(getRankingList + page.toString() + '/json');
	
	// 登录
	let login = (username, password) => vm.$u.post(postLogin + "?username=" + username + "&password=" + password);
	
	// 注册
	let register = (username, password, repassword) => vm.$u.post(postRegister + "?username=" + username + "&password=" + password + "&repassword=" + repassword);
	
	// 登出
	let logout = (params = {}) => vm.$u.get(getLogout, params);
	
	// 个人积分信息
	let userCoinInfo = (params = {}) => vm.$u.get(getUserCoinInfo, params);
	
	// 积分历史列表
	let myCoinList = (page) => vm.$u.get(getCoinList + page.toString() + '/json');
	
	// 个人收藏
	let collectArticleList = (page) => vm.$u.get(getCollectArticleList + page.toString() + '/json');
	
	// 将各个定义的接口名称，统一放进对象挂载到vm.$u.api(因为vm就是this，也即this.$u.api)下
	vm.$u.api = {
		banner, 
		top, 
		normal, 
		hotKey, 
		queryKeyword, 
		projectTopic, 
		projectList, 
		publicNumTopic, 
		publicNumList, 
		tree, 
		treeDetail,
		totalRankingList,
		login,
		register,
		logout,
		userCoinInfo,
		myCoinList,
		collectArticleList,
	};
}

export default {
	install
}