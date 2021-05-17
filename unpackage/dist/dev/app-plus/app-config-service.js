
var isReady=false;var onReadyCallbacks=[];
var isServiceReady=false;var onServiceReadyCallbacks=[];
var __uniConfig = {"pages":["pages/index/index","pages/index/search","pages/index/result","pages/infomation/index","pages/publicNum/index","pages/my/index","pages/my/tree","pages/my/detail","pages/my/ranking","pages/web/index","pages/login/index","pages/login/register","pages/my/history","pages/my/collection"],"window":{"navigationBarTextStyle":"white","navigationBarTitleText":"play android","navigationBarBackgroundColor":"#2979FF","backgroundColor":"#F8F8F8"},"tabBar":{"color":"#909399","selectedColor":"#303133","backgroundColor":"#FFFFFF","borderStyle":"black","list":[{"pagePath":"pages/index/index","iconPath":"static/uview/example/component.png","selectedIconPath":"static/uview/example/component_select.png","text":"首页"},{"pagePath":"pages/infomation/index","iconPath":"static/uview/example/js.png","selectedIconPath":"static/uview/example/js_select.png","text":"项目"},{"pagePath":"pages/publicNum/index","iconPath":"static/uview/example/js_bak.png","selectedIconPath":"static/uview/example/js_select_bak.png","text":"公众号"},{"pagePath":"pages/my/index","iconPath":"static/uview/example/template.png","selectedIconPath":"static/uview/example/template_select.png","text":"我的"}]},"nvueCompiler":"uni-app","nvueStyleCompiler":"weex","renderer":"auto","splashscreen":{"alwaysShowBeforeRender":true,"autoclose":false},"appname":"Tabbar","compilerVersion":"3.1.13","entryPagePath":"pages/index/index","networkTimeout":{"request":60000,"connectSocket":60000,"uploadFile":60000,"downloadFile":60000}};
var __uniRoutes = [{"path":"/pages/index/index","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"首页","enablePullDownRefresh":true,"titleNView":{"buttons":[{"color":"#fff","colorPressed":"#fff","float":"right","fontSize":"14px","text":"搜索  "}]}}},{"path":"/pages/index/search","meta":{},"window":{"navigationBarTitleText":"搜索","titleNView":{"searchInput":{"align":"left","backgroundColor":"#eee","borderRadius":"5px","placeholder":"请输入内容","placeholderColor":"#ccc"},"buttons":[{"color":"#fff","colorPressed":"#fff","float":"right","fontSize":"14px","text":"  确定  "}]}}},{"path":"/pages/index/result","meta":{},"window":{"navigationBarTitleText":"搜索结果"}},{"path":"/pages/infomation/index","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"项目"}},{"path":"/pages/publicNum/index","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"公众号"}},{"path":"/pages/my/index","meta":{"isQuit":true,"isTabBar":true},"window":{"navigationBarTitleText":"我的","enablePullDownRefresh":true}},{"path":"/pages/my/tree","meta":{},"window":{"navigationBarTitleText":"体系"}},{"path":"/pages/my/detail","meta":{},"window":{"navigationBarTitleText":"体系详细"}},{"path":"/pages/my/ranking","meta":{},"window":{"navigationBarTitleText":"积分排名"}},{"path":"/pages/web/index","meta":{},"window":{"navigationBarTitleText":"详细","titleNView":{"buttons":[{"color":"#fff","colorPressed":"#fff","float":"right","fontSize":"14px","text":"功能"}]}}},{"path":"/pages/login/index","meta":{},"window":{"navigationBarTitleText":"登录"}},{"path":"/pages/login/register","meta":{},"window":{"navigationBarTitleText":"注册"}},{"path":"/pages/my/history","meta":{},"window":{"navigationBarTitleText":"我的积分历史"}},{"path":"/pages/my/collection","meta":{},"window":{"navigationBarTitleText":"我的收藏","enablePullDownRefresh":false}}];
__uniConfig.onReady=function(callback){if(__uniConfig.ready){callback()}else{onReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"ready",{get:function(){return isReady},set:function(val){isReady=val;if(!isReady){return}const callbacks=onReadyCallbacks.slice(0);onReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
__uniConfig.onServiceReady=function(callback){if(__uniConfig.serviceReady){callback()}else{onServiceReadyCallbacks.push(callback)}};Object.defineProperty(__uniConfig,"serviceReady",{get:function(){return isServiceReady},set:function(val){isServiceReady=val;if(!isServiceReady){return}const callbacks=onServiceReadyCallbacks.slice(0);onServiceReadyCallbacks.length=0;callbacks.forEach(function(callback){callback()})}});
service.register("uni-app-config",{create(a,b,c){if(!__uniConfig.viewport){var d=b.weex.config.env.scale,e=b.weex.config.env.deviceWidth,f=Math.ceil(e/d);Object.assign(__uniConfig,{viewport:f,defaultFontSize:Math.round(f/20)})}return{instance:{__uniConfig:__uniConfig,__uniRoutes:__uniRoutes,global:void 0,window:void 0,document:void 0,frames:void 0,self:void 0,location:void 0,navigator:void 0,localStorage:void 0,history:void 0,Caches:void 0,screen:void 0,alert:void 0,confirm:void 0,prompt:void 0,fetch:void 0,XMLHttpRequest:void 0,WebSocket:void 0,webkit:void 0,print:void 0}}}});
