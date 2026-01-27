"use weex:vue";

if (typeof Promise !== 'undefined' && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor
    return this.then(
      value => promise.resolve(callback()).then(() => value),
      reason => promise.resolve(callback()).then(() => {
        throw reason
      })
    )
  }
};

if (typeof uni !== 'undefined' && uni && uni.requireGlobal) {
  const global = uni.requireGlobal()
  ArrayBuffer = global.ArrayBuffer
  Int8Array = global.Int8Array
  Uint8Array = global.Uint8Array
  Uint8ClampedArray = global.Uint8ClampedArray
  Int16Array = global.Int16Array
  Uint16Array = global.Uint16Array
  Int32Array = global.Int32Array
  Uint32Array = global.Uint32Array
  Float32Array = global.Float32Array
  Float64Array = global.Float64Array
  BigInt64Array = global.BigInt64Array
  BigUint64Array = global.BigUint64Array
};


(()=>{var u=Object.create;var l=Object.defineProperty;var i=Object.getOwnPropertyDescriptor;var m=Object.getOwnPropertyNames;var y=Object.getPrototypeOf,g=Object.prototype.hasOwnProperty;var b=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var v=(t,e,p,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of m(e))!g.call(t,s)&&s!==p&&l(t,s,{get:()=>e[s],enumerable:!(r=i(e,s))||r.enumerable});return t};var w=(t,e,p)=>(p=t!=null?u(y(t)):{},v(e||!t||!t.__esModule?l(p,"default",{value:t,enumerable:!0}):p,t));var _=b((f,c)=>{c.exports=Vue});var o=w(_()),a={__name:"nativeMapComponent",setup(t){return(e,p)=>{let r=(0,o.resolveComponent)("testmap");return(0,o.openBlock)(),(0,o.createElementBlock)("scroll-view",{scrollY:!0,showScrollbar:!0,enableBackToTop:!0,bubble:"true",style:{flexDirection:"column"}},[(0,o.createElementVNode)("div",null,[(0,o.createVNode)(r,{style:{width:"100%",height:"600px"}})])])}}};var n=plus.webview.currentWebview();if(n){let t=parseInt(n.id),e="pages/my/nativeMapComponent",p={};try{p=JSON.parse(n.__query__)}catch(s){}a.mpType="page";let r=Vue.createPageApp(a,{$store:getApp({allowDefault:!0}).$store,__pageId:t,__pagePath:e,__pageQuery:p});r.provide("__globalStyles",Vue.useCssStyles([...__uniConfig.styles,...a.styles||[]])),r.mount("#root")}})();
