(global["webpackJsonp"]=global["webpackJsonp"]||[]).push([["pages/indexApp/jjr/jjr"],{"3de7":function(t,e,n){},6621:function(t,e,n){"use strict";var r=n("3de7"),o=n.n(r);o.a},6975:function(t,e,n){"use strict";(function(t){var e=n("4ea4");n("a32b");e(n("66fd"));var r=e(n("b97e"));wx.__webpack_require_UNI_MP_PLUGIN__=n,t(r.default)}).call(this,n("543d")["createPage"])},af7a:function(t,e,n){"use strict";n.d(e,"b",(function(){return r})),n.d(e,"c",(function(){return o})),n.d(e,"a",(function(){}));var r=function(){var t=this.$createElement;this._self._c},o=[]},b97e:function(t,e,n){"use strict";n.r(e);var r=n("af7a"),o=n("ede8");for(var i in o)["default"].indexOf(i)<0&&function(t){n.d(e,t,(function(){return o[t]}))}(i);n("6621");var a=n("f0c5"),u=Object(a["a"])(o["default"],r["b"],r["c"],!1,null,"4fba063d",null,!1,r["a"],void 0);e["default"]=u.exports},ede8:function(t,e,n){"use strict";n.r(e);var r=n("fd7b"),o=n.n(r);for(var i in r)["default"].indexOf(i)<0&&function(t){n.d(e,t,(function(){return r[t]}))}(i);e["default"]=o.a},fd7b:function(t,e,n){"use strict";(function(t){var r=n("4ea4");Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var o,i=r(n("9523")),a=n("0105");function u(t,e){var n=Object.keys(t);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(t);e&&(r=r.filter((function(e){return Object.getOwnPropertyDescriptor(t,e).enumerable}))),n.push.apply(n,r)}return n}function c(t){for(var e=1;e<arguments.length;e++){var n=null!=arguments[e]?arguments[e]:{};e%2?u(Object(n),!0).forEach((function(e){(0,i.default)(t,e,n[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(n)):u(Object(n)).forEach((function(e){Object.defineProperty(t,e,Object.getOwnPropertyDescriptor(n,e))}))}return t}var s={components:{CountDown:function(){n.e("components/countDown/countDown").then(function(){return resolve(n("e67c"))}.bind(null,n)).catch(n.oe)}},data:function(){return{currentYear:null,jjrList:[],gooffworktime:0,gooffworkData:{}}},created:function(){this.xbdjs()},onLoad:function(){},onShareAppMessage:function(t){return{title:"节假日倒计时",path:"/pages/indexApp/jjr/jjr",success:function(t){},fail:function(t){}}},beforeDestroy:function(){clearInterval(this.timer)},methods:(o={getjjr:function(){var t=new Date,e=t.getTime();this.currentYear=t.getFullYear();for(var n=[],r=0;r<a.jjrDate.length;r++){var o=new Date(a.jjrDate[r].date),i=o.getTime(),u=i-e;n.push(c(c({},a.jjrDate[r]),{},{timestamp:this.getInfo(u)}))}this.jjrList=n},xbdjs:function(){var t=this;this.getjjr(),this.timer=setInterval((function(){t.getjjr()}),1e3)},getInfo:function(t){var e=Math.floor(t/1e3/60/60/24),n=(Math.floor(t/1e3/60/60%24),Math.floor(t/1e3/60%60)),r=Math.floor(t/1e3%60),o={day:e<10?"0"+e:e,hour:hou<10?"0"+hou:hou,min:n<10?"0"+n:n,second:r<10?"0"+r:r};return o},dingyue:function(){var e=this,n=this.$currency.getOpenid();if(!n)return wx.showToast({title:"请先登录",icon:"none"}),void t.navigateTo({url:"/pages/indexApp/setting/setting"});wx.requestSubscribeMessage({tmplIds:["p-QrOW7q2s7DzMAWgoKvRnVzl717__iYP3yU3emOO24","p-QrOW7q2s7DzMAWgoKvRr1Z0TPTnx0laB7u8aafy5g"],success:function(t){"requestSubscribeMessage:ok"==t.errMsg?e.binddy(n):wx.showToast({title:"订阅失败",icon:"error"})},fail:function(t){wx.showToast({title:"取消订阅",icon:"error"})}})},binddy:function(t){this.$http({url:"/wx/bindsubscribe",method:"post",data:{tmplIds:"p-QrOW7q2s7DzMAWgoKvRnVzl717__iYP3yU3emOO24",jjr_tmplIds:"p-QrOW7q2s7DzMAWgoKvRr1Z0TPTnx0laB7u8aafy5g",openid:t}}).then((function(t){t.success?wx.showToast({title:"订阅成功"}):wx.showToast({title:"订阅失败",icon:"error"})}))},gettimes:function(t){console.log(t);var e=new Date(t.time).getTime(),n=e-(new Date).getTime();return n/1e3},getdata:function(t,e){return t},finish:function(){this.getjjr()}},(0,i.default)(o,"getInfo",(function(t){var e=Math.floor(t/1e3/60/60/24),n=Math.floor(t/1e3/60/60%24),r=Math.floor(t/1e3/60%60),o=Math.floor(t/1e3%60),i={day:e<10?"0"+e:e,hour:n<10?"0"+n:n,min:r<10?"0"+r:r,second:o<10?"0"+o:o};return i})),(0,i.default)(o,"onChange",(function(t,e,n){})),o)};e.default=s}).call(this,n("543d")["default"])}},[["6975","common/runtime","common/vendor"]]]);