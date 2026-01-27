// API 基础配置
// #ifdef H5
const httpConfig = {
	baseUrl: '/api', // H5环境使用代理
	header: {
		'Access-Control-Allow-Origin': 'https://www.wanandroid.com',
		'Access-Control-Allow-Credentials': true,
	}
}
// #endif

// #ifndef H5
const httpConfig = {
	baseUrl: 'https://www.wanandroid.com/', // 非H5环境直接请求
	header: {
		'Access-Control-Allow-Origin': 'https://www.wanandroid.com',
		'Access-Control-Allow-Credentials': true,
	}
}
// #endif

// API 路径定义
export const apiPaths = {
	banner: 'banner/json',
	topArticle: 'article/top/json',
	normalArticle: 'article/list/',
	searchHotKey: 'hotkey/json',
	queryKey: 'article/query/',
	projectClassify: 'project/tree/json',
	projectClassifyList: 'project/list/',
	publicNumber: 'wxarticle/chapters/json',
	publicNumberList: 'wxarticle/list/',
	login: 'user/login',
	register: 'user/register',
	logout: 'user/logout/json',
	collectArticle: 'lg/collect/',
	unCollectArticle: 'lg/uncollect_originId/',
	collectArticleList: 'lg/collect/list/',
	rankingList: 'coin/rank/',
	coinList: 'lg/coin/list/',
	userCoinInfo: 'lg/coin/userinfo/json',
	tree: 'tree/json',
	treeDetailList: 'article/list/',
}

export { httpConfig }
