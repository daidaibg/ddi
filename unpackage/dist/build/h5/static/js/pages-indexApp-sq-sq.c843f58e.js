(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["pages-indexApp-sq-sq"],{"27aa":function(t,e,n){var i=n("be27");"string"===typeof i&&(i=[[t.i,i,""]]),i.locals&&(t.exports=i.locals);var a=n("4f06").default;a("48eddc02",i,!0,{sourceMap:!1,shadowMode:!1})},"392f":function(t,e,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var i={data:function(){return{wxUserInfo:null}},onLoad:function(){this.userdata()},methods:{userdata:function(){var t=wx.getStorageSync("wxUserInfo");t&&(console.log(t),this.wxUserInfo=t)},getUserProfile:function(){var t=this;wx.getUserProfile({desc:"获取您的名称",success:function(e){console.log(e),wx.setStorageSync("wxUserInfo",e.userInfo),t.userdata(),wx.showToast({title:"授权成功！"})},fail:function(t){console.log(t)}})}}};e.default=i},a971:function(t,e,n){"use strict";n.r(e);var i=n("d52c"),a=n("fb24");for(var s in a)"default"!==s&&function(t){n.d(e,t,(function(){return a[t]}))}(s);n("cf40");var r,o=n("f0c5"),c=Object(o["a"])(a["default"],i["b"],i["c"],!1,null,"080024ce",null,!1,i["a"],r);e["default"]=c.exports},be27:function(t,e,n){var i=n("24fb");e=i(!1),e.push([t.i,'@charset "UTF-8";\r\n/**\r\n * 这里是uni-app内置的常用样式变量\r\n *\r\n * uni-app 官方扩展插件及插件市场（https://ext.dcloud.net.cn）上很多三方插件均使用了这些样式变量\r\n * 如果你是插件开发者，建议你使用scss预处理，并在插件代码中直接使用这些变量（无需 import 这个文件），方便用户通过搭积木的方式开发整体风格一致的App\r\n *\r\n */\r\n/**\r\n * 如果你是App开发者（插件使用者），你可以通过修改这些变量来定制自己的插件主题，实现自定义主题功能\r\n *\r\n * 如果你的项目同样使用了scss预处理，你也可以直接在你的 scss 代码中使用如下变量，同时无需 import 这个文件\r\n */\r\n/* 颜色变量 */\r\n/* 行为相关颜色 */\r\n/* 文字基本颜色 */\r\n/* 背景颜色 */\r\n/* 边框颜色 */\r\n/* 尺寸变量 */\r\n/* 文字尺寸 */\r\n/* 图片尺寸 */\r\n/* Border Radius */\r\n/* 水平间距 */\r\n/* 垂直间距 */\r\n/* 透明度 */\r\n/* 文章场景相关 */.sq[data-v-080024ce]{width:100%;min-height:100vh;background:#fff}.sq .imageWrap[data-v-080024ce]{width:100%;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-pack:center;-webkit-justify-content:center;justify-content:center;padding:%?60?%;border-bottom:%?2?% #e2e2e2 solid}.sq .imageWrap uni-image[data-v-080024ce]{width:%?360?%;height:%?360?%}.sq .title[data-v-080024ce]{font-size:%?28?%;font-weight:900;padding:%?30?% 0 %?18?% %?30?%}.sq .content[data-v-080024ce]{padding:0 %?60?%;color:#878787;font-size:%?24?%;margin-bottom:%?30?%}.sq .buttom_Wrap[data-v-080024ce]{width:100%;padding:0 %?60?%;-webkit-box-pack:center;-webkit-justify-content:center;justify-content:center}.sq .userdata[data-v-080024ce]{width:100%;display:-webkit-box;display:-webkit-flex;display:flex;padding:%?30?% %?40?%}.sq .userdata uni-image[data-v-080024ce]{width:%?100?%;height:%?100?%}.sq .userdata .userInfo[data-v-080024ce]{margin-left:%?20?%;display:-webkit-box;display:-webkit-flex;display:flex;-webkit-box-orient:vertical;-webkit-box-direction:normal;-webkit-flex-direction:column;flex-direction:column;-webkit-box-pack:center;-webkit-justify-content:center;justify-content:center}.sq .userdata .userInfo uni-text[data-v-080024ce]{color:#737373}.sq .userdata .userInfo .name[data-v-080024ce]{margin-bottom:%?10?%}.sq .userdata .userInfo .name uni-text[data-v-080024ce]:first-child{color:#000;font-size:%?30?%;font-weight:900}',""]),t.exports=e},cf40:function(t,e,n){"use strict";var i=n("27aa"),a=n.n(i);a.a},d52c:function(t,e,n){"use strict";var i;n.d(e,"b",(function(){return a})),n.d(e,"c",(function(){return s})),n.d(e,"a",(function(){return i}));var a=function(){var t=this,e=t.$createElement,n=t._self._c||e;return n("v-uni-view",{staticClass:"sq"},[t.wxUserInfo?n("v-uni-view",{},[n("v-uni-view",{staticClass:"userdata"},[n("v-uni-image",{attrs:{src:t.wxUserInfo.avatarUrl,mode:""}}),n("v-uni-view",{staticClass:"userInfo"},[n("v-uni-view",{staticClass:"name"},[n("v-uni-text",[t._v(t._s(t.wxUserInfo.nickName))]),n("v-uni-text",[t._v("（已授权）")])],1),n("v-uni-view",{staticClass:"address"},[n("v-uni-text",[t._v("地址：")]),n("v-uni-text",[t._v(t._s(t.wxUserInfo.country)+"-"+t._s(t.wxUserInfo.province)+"-"+t._s(t.wxUserInfo.city))])],1)],1)],1)],1):n("v-uni-view",[n("v-uni-view",{staticClass:"imageWrap"},[n("v-uni-image",{attrs:{src:"http://www.daidaibg.com/statics/images/xcx.jpg",mode:""}})],1),n("v-uni-view",{staticClass:"title"},[t._v("小程序需要获得您以下权限")]),n("v-uni-view",{staticClass:"content"},[t._v("· 获得您的公开信息")]),n("v-uni-view",{staticClass:"buttom_Wrap"},[n("v-uni-button",{attrs:{type:"primary","open-type":"getUserProfile"},on:{click:function(e){arguments[0]=e=t.$handleEvent(e),t.getUserProfile.apply(void 0,arguments)}}},[t._v("获取头像昵称")])],1)],1)],1)},s=[]},fb24:function(t,e,n){"use strict";n.r(e);var i=n("392f"),a=n.n(i);for(var s in i)"default"!==s&&function(t){n.d(e,t,(function(){return i[t]}))}(s);e["default"]=a.a}}]);