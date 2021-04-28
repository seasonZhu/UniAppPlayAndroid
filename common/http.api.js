let getBanner = 'banner/json';

let topArticle = 'article/top/json'

let normalArticle = 'article/list/'

let getSearchHotKey = 'hotkey/json'

/// 应该是post请求都有异常,需要跟踪调试
let queryKey = 'article/query/'

let getProjectClassify = 'project/tree/json';

let getProjectClassifyList = 'project/list/';

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
	
	// 关键词搜索
	let queryKeyword = (params = {}, page) => vm.$u.post(queryKey  + '0' + '/json', params);
	
	// 项目分类
	let projectTopic = (params = {}) => vm.$u.get(getProjectClassify, params);
	
	// 项目列表
	let projectList = (params = {}, page) => vm.$u.get(getProjectClassifyList+ page.toString() + "/json", params);
	
	// 将各个定义的接口名称，统一放进对象挂载到vm.$u.api(因为vm就是this，也即this.$u.api)下
	vm.$u.api = {banner, top, normal, hotKey, queryKeyword, projectTopic, projectList};
}

export default {
	install
}