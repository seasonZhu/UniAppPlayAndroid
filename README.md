# 前言
都说万事开头难，一点也不假。

从我计划学习uni-app到真正意义上的开始写代码，真的是花了很久的时间。

其实一旦手动起来了，也没有想象的那么难，毕竟是写过OC、Swift、Flutter、Python的人了，JavaScript写起来就是信手拈来的事情。

苦手的是样式CSS，我感觉我好不容易适应了Flutter的布局逻辑，突然来HTML的这一波，感觉怎么又懵逼了，思路一样，不过写起CSS来，还是一点办法都没有。

目前有几个比较大的问题：

1.网络请求接口，在chrome浏览器中、app、小程序中，在请求头中加上了cookie还是不能调用登录后的一些接口，Request的header设置的有问题。

请求头中加上了cookie的问题已经解决，在请求拦截器中配置cookie即可。

2.项目和公众号页面的tabs与页面滑动，完全还没有好，目前是可以用，但是实现起来比较傻，其实是想让每个人页面独立，这样比较好，目前没有找到好的方法，而且公众号详细页面在内置浏览器中是打不开的。

这个问题，我尝试使用两个方案，在项目页面，一个是一个一个页面的加载，这样从体验和流量考虑都是比较好的，但是上拉加载更多的状态和文字显示有问题。

在公众号页面，获取完顶层的topics后，一口气请求所以的接口，然后在进行滑动，这个体验可能会有比较明显的卡顿，而且不节约流量。

另外SwiperPage滑动，tabs滑动，在超过边界的时候没有滚动到可视区域

3.简单适配，slot的使用尝试。

在项目页面的cell的右侧使用了slot，基本上和我之前想法一致，说白了就是一个() -> Widget的闭包，目前适配的也算不错

4.目前对于组件化、方法的公共化都不是很了解。

5.尤其是chrome，接口基本上就是不通的。

这个问题基本上知道，其实是由于跨域请求导致，本地的http://localhost:8080需要跳转调用https://www.wanandroid.com,浏览器认为不安全，所以被拦截了

Refused to set unsafe header "cookie"

Access to XMLHttpRequest at 'https://www.wanandroid.com//coin/rank/1/json' from origin 'http://localhost:8080' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

GET https://www.wanandroid.com//coin/rank/1/json net::ERR_FAILED

http://localhost:8080/#/pages/my/ranking/:1 Uncaught (in promise) {errMsg: "request:fail"}

6.收藏页面的侧滑在App端显示是有问题的。

7.web页面的功能按钮在iOS端和Android端都无法弹出。微信小程序无法弹出是因为右侧被微信占用了。

8.收藏与取消收藏的功能与页面逻辑完成，这个可能是唯一个玩安卓中逻辑与UI绑定稍微复杂一点的位置了。
